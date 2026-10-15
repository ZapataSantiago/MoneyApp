export type AccountType = 'cash' | 'bank' | 'card';

export const ACCOUNT_TYPES: { value: AccountType; label: string; emoji: string }[] = [
  { value: 'cash', label: 'Efectivo', emoji: '💵' },
  { value: 'bank', label: 'Banco', emoji: '🏦' },
  { value: 'card', label: 'Tarjeta', emoji: '💳' },
];

/** Colores de sistema de Apple (modo claro). */
export const CATEGORY_COLORS = [
  '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#00C7BE', '#30B0C7',
  '#32ADE6', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#A2845E',
];
