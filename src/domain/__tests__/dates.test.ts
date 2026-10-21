import {
  currentYearMonth,
  formatDayLabel,
  monthLabel,
  monthRange,
  shiftMonth,
  toDateString,
} from '@/domain/dates';

describe('toDateString', () => {
  it('usa la fecha local con ceros a la izquierda', () =>
    expect(toDateString(new Date(2026, 9, 5))).toBe('2026-10-05'));
});

describe('shiftMonth', () => {
  it('pasa de diciembre a enero del año siguiente', () =>
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 }));
  it('pasa de enero a diciembre del año anterior', () =>
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 }));
});

describe('monthRange', () => {
  it('diciembre termina en el 1 de enero siguiente', () =>
    expect(monthRange({ year: 2026, month: 11 })).toEqual({ from: '2026-12-01', to: '2027-01-01' }));
  it('febrero bisiesto', () =>
    expect(monthRange({ year: 2024, month: 1 })).toEqual({ from: '2024-02-01', to: '2024-03-01' }));
  it('el 31 de octubre está en octubre y el 1 de noviembre no', () => {
    const { from, to } = monthRange({ year: 2026, month: 9 });
    expect('2026-10-31' >= from && '2026-10-31' < to).toBe(true);
    expect('2026-11-01' >= to).toBe(true);
  });
});

describe('currentYearMonth', () => {
  it('toma el mes local aunque sea la última hora del mes', () =>
    expect(currentYearMonth(new Date(2026, 9, 31, 23, 59))).toEqual({ year: 2026, month: 9 }));
});

describe('monthLabel', () => {
  it('nombre del mes en español con mayúscula', () =>
    expect(monthLabel({ year: 2026, month: 9 })).toBe('Octubre de 2026'));
});

describe('formatDayLabel', () => {
  const today = new Date(2026, 9, 15);
  it('hoy y ayer', () => {
    expect(formatDayLabel('2026-10-15', today)).toBe('Hoy');
    expect(formatDayLabel('2026-10-14', today)).toBe('Ayer');
  });
  it('otro día del mismo año', () => expect(formatDayLabel('2026-10-03', today)).toBe('3 oct'));
  it('otro año', () => expect(formatDayLabel('2025-10-03', today)).toBe('3 oct 2025'));
});
