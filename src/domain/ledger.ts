export type MovementLite = { kind: 'expense' | 'income'; amount: number; category_id: string; date: string };
export type CategoryLite = { id: string; group_id: string | null };
export type GroupLite = { id: string; is_fixed: boolean };

export type MonthSummary = {
  income: number;
  expense: number;
  fixedExpense: number;
  variableExpense: number;
  byCategory: { categoryId: string; total: number; share: number; fixed: boolean }[];
};

/** Totales del mes. Una categoría sin grupo cuenta como gasto variable. */
export function summarizeMonth(
  movements: MovementLite[],
  categories: CategoryLite[],
  groups: GroupLite[],
): MonthSummary {
  const fixedGroups = new Set(groups.filter((g) => g.is_fixed).map((g) => g.id));
  const groupOf = new Map(categories.map((c) => [c.id, c.group_id]));
  const isFixed = (categoryId: string) => fixedGroups.has(groupOf.get(categoryId) ?? '');

  let income = 0;
  let expense = 0;
  let fixedExpense = 0;
  const totals = new Map<string, number>();
  for (const mv of movements) {
    if (mv.kind === 'income') {
      income += mv.amount;
      continue;
    }
    expense += mv.amount;
    if (isFixed(mv.category_id)) fixedExpense += mv.amount;
    totals.set(mv.category_id, (totals.get(mv.category_id) ?? 0) + mv.amount);
  }

  const byCategory = [...totals]
    .map(([categoryId, total]) => ({
      categoryId,
      total,
      share: expense ? total / expense : 0,
      fixed: isFixed(categoryId),
    }))
    .sort((a, b) => b.total - a.total);

  return { income, expense, fixedExpense, variableExpense: expense - fixedExpense, byCategory };
}

/** Suma los saldos en la moneda principal y lista las otras monedas (aún sin conversión). */
export function splitBalances(
  accounts: { currency: string; balance: number }[],
  main: string,
): { total: number; otherCurrencies: string[] } {
  const total = accounts.filter((a) => a.currency === main).reduce((s, a) => s + a.balance, 0);
  const otherCurrencies = [...new Set(accounts.map((a) => a.currency).filter((c) => c !== main))].sort();
  return { total, otherCurrencies };
}

export function inCurrency<T extends { account_id: string }>(
  items: T[],
  accounts: { id: string; currency: string }[],
  currency: string,
): T[] {
  const ids = new Set(accounts.filter((a) => a.currency === currency).map((a) => a.id));
  return items.filter((i) => ids.has(i.account_id));
}

export function groupByDay<T extends { date: string }>(items: T[]): { date: string; items: T[] }[] {
  const days = new Map<string, T[]>();
  for (const item of items) days.set(item.date, [...(days.get(item.date) ?? []), item]);
  return [...days]
    .map(([date, dayItems]) => ({ date, items: dayItems }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
