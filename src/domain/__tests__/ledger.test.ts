import { groupByDay, inCurrency, splitBalances, summarizeMonth } from '@/domain/ledger';

const groups = [
  { id: 'gFijos', is_fixed: true },
  { id: 'gVar', is_fixed: false },
];
const categories = [
  { id: 'arriendo', group_id: 'gFijos' },
  { id: 'servicios', group_id: 'gFijos' },
  { id: 'comida', group_id: 'gVar' },
  { id: 'regalos', group_id: null },
  { id: 'salario', group_id: null },
];
const m = (kind: 'expense' | 'income', amount: number, category_id: string, date = '2026-10-10') => ({
  kind,
  amount,
  category_id,
  date,
});

describe('summarizeMonth', () => {
  const summary = summarizeMonth(
    [
      m('expense', 600, 'arriendo'),
      m('expense', 100, 'servicios'),
      m('expense', 200, 'comida'),
      m('expense', 50, 'comida'),
      m('expense', 50, 'regalos'),
      m('income', 3000, 'salario'),
    ],
    categories,
    groups,
  );

  it('suma ingresos y gastos', () => {
    expect(summary.income).toBe(3000);
    expect(summary.expense).toBe(1000);
  });
  it('separa fijos y variables; sin grupo cuenta como variable', () => {
    expect(summary.fixedExpense).toBe(700);
    expect(summary.variableExpense).toBe(300);
    expect(summary.byCategory.find((c) => c.categoryId === 'regalos')?.fixed).toBe(false);
  });
  it('agrupa gastos por categoría de mayor a menor con su proporción', () => {
    expect(summary.byCategory.map((c) => [c.categoryId, c.total])).toEqual([
      ['arriendo', 600],
      ['comida', 250],
      ['servicios', 100],
      ['regalos', 50],
    ]);
    expect(summary.byCategory[0].share).toBeCloseTo(0.6);
    expect(summary.byCategory.reduce((s, c) => s + c.share, 0)).toBeCloseTo(1);
  });
  it('los ingresos no aparecen en gastos por categoría', () =>
    expect(summary.byCategory.some((c) => c.categoryId === 'salario')).toBe(false));

  it('sin movimientos todo queda en cero, sin NaN', () =>
    expect(summarizeMonth([], [], [])).toEqual({
      income: 0,
      expense: 0,
      fixedExpense: 0,
      variableExpense: 0,
      byCategory: [],
    }));
  it('solo ingresos', () => {
    const s = summarizeMonth([m('income', 500, 'salario')], categories, groups);
    expect(s.expense).toBe(0);
    expect(s.byCategory).toEqual([]);
  });
});

describe('splitBalances', () => {
  it('suma solo la moneda principal y lista las demás', () =>
    expect(
      splitBalances(
        [
          { currency: 'COP', balance: 100 },
          { currency: 'USD', balance: 5 },
          { currency: 'USD', balance: 7 },
          { currency: 'EUR', balance: 1 },
        ],
        'COP',
      ),
    ).toEqual({ total: 100, otherCurrencies: ['EUR', 'USD'] }));
});

describe('inCurrency', () => {
  it('deja solo los movimientos de cuentas en la moneda pedida', () => {
    const accounts = [
      { id: 'a1', currency: 'COP' },
      { id: 'a2', currency: 'USD' },
    ];
    const items = [{ account_id: 'a1' }, { account_id: 'a2' }, { account_id: 'a1' }];
    expect(inCurrency(items, accounts, 'COP')).toEqual([{ account_id: 'a1' }, { account_id: 'a1' }]);
  });
});

describe('groupByDay', () => {
  it('agrupa por día del más reciente al más antiguo y conserva el orden', () => {
    const items = [
      { id: 1, date: '2026-10-02' },
      { id: 2, date: '2026-10-05' },
      { id: 3, date: '2026-10-02' },
    ];
    expect(groupByDay(items)).toEqual([
      { date: '2026-10-05', items: [{ id: 2, date: '2026-10-05' }] },
      { date: '2026-10-02', items: [{ id: 1, date: '2026-10-02' }, { id: 3, date: '2026-10-02' }] },
    ]);
  });
});
