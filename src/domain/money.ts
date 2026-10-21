export type CurrencyCode = 'COP' | 'USD' | 'EUR' | 'MXN';

export const CURRENCIES: Record<CurrencyCode, { name: string; decimals: number }> = {
  COP: { name: 'Peso colombiano', decimals: 0 },
  USD: { name: 'Dólar estadounidense', decimals: 2 },
  EUR: { name: 'Euro', decimals: 2 },
  MXN: { name: 'Peso mexicano', decimals: 2 },
};

const grouped = (sep: string) => new RegExp(`^\\d{1,3}(\\${sep}\\d{3})+$`);

/** Convierte texto escrito por el usuario a unidades mínimas. null si no es válido. */
export function parseAmount(text: string, currency: CurrencyCode): number | null {
  const { decimals } = CURRENCIES[currency];
  let s = text.replace(/[\s$]/g, '');
  const negative = s.startsWith('-');
  if (negative) s = s.slice(1);
  if (!/^\d[\d.,]*$/.test(s)) return null;

  let intPart = s;
  let frac = '';
  const hasDot = s.includes('.');
  const hasComma = s.includes(',');
  if (hasDot && hasComma) {
    // El último separador es el decimal; el otro, de miles.
    const dec = s.lastIndexOf('.') > s.lastIndexOf(',') ? '.' : ',';
    const thousands = dec === '.' ? ',' : '.';
    const i = s.lastIndexOf(dec);
    intPart = s.slice(0, i);
    frac = s.slice(i + 1);
    if (!grouped(thousands).test(intPart)) return null;
    intPart = intPart.split(thousands).join('');
  } else if (hasDot || hasComma) {
    const sep = hasDot ? '.' : ',';
    const parts = s.split(sep);
    if (grouped(sep).test(s)) intPart = parts.join('');
    else if (parts.length === 2) [intPart, frac] = parts;
    else return null;
  }

  if (!/^\d+$/.test(intPart) || !/^\d*$/.test(frac) || frac.length > decimals) return null;
  const value = Number(intPart) * 10 ** decimals + Number(frac.padEnd(decimals, '0') || 0);
  return negative ? -value : value;
}

export function formatMoney(minor: number, currency: CurrencyCode): string {
  const { decimals } = CURRENCIES[currency];
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(minor / 10 ** decimals);
}

/** Monto sin separadores de miles y con coma decimal, para precargar un campo. */
export function amountToInput(minor: number, currency: CurrencyCode): string {
  const { decimals } = CURRENCIES[currency];
  const sign = minor < 0 ? '-' : '';
  const abs = Math.abs(minor);
  if (decimals === 0) return `${sign}${abs}`;
  const int = Math.floor(abs / 10 ** decimals);
  const frac = String(abs % 10 ** decimals).padStart(decimals, '0');
  return `${sign}${int},${frac}`;
}
