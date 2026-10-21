// Las fechas de movimientos son texto 'YYYY-MM-DD' (sin hora ni zona horaria):
// comparar cadenas basta para saber en qué mes cae cada una.

export type YearMonth = { year: number; month: number }; // month 0–11

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;

export function toDateString(d: Date): string {
  return ymd(d.getFullYear(), d.getMonth(), d.getDate());
}

export function currentYearMonth(now: Date = new Date()): YearMonth {
  return { year: now.getFullYear(), month: now.getMonth() };
}

export function shiftMonth({ year, month }: YearMonth, delta: number): YearMonth {
  const total = year * 12 + month + delta;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
}

/** Mes como rango de fechas: `from` inclusivo, `to` exclusivo (primer día del mes siguiente). */
export function monthRange(ym: YearMonth): { from: string; to: string } {
  const next = shiftMonth(ym, 1);
  return { from: ymd(ym.year, ym.month, 1), to: ymd(next.year, next.month, 1) };
}

export function monthLabel({ year, month }: YearMonth): string {
  const name = MONTHS[month];
  return `${name[0].toUpperCase()}${name.slice(1)} de ${year}`;
}

export function formatDayLabel(date: string, today: Date = new Date()): string {
  if (date === toDateString(today)) return 'Hoy';
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (date === toDateString(yesterday)) return 'Ayer';
  const [y, m, d] = date.split('-').map(Number);
  const label = `${d} ${MONTHS_SHORT[m - 1]}`;
  return y === today.getFullYear() ? label : `${label} ${y}`;
}
