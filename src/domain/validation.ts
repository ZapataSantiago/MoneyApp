export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Escribe un nombre';
  if (trimmed.length > 40) return 'Máximo 40 caracteres';
  return null;
}

export function validateCredentials(email: string, password: string): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Escribe un correo válido';
  if (password.length < 8) return 'La contraseña debe tener mínimo 8 caracteres';
  return null;
}

export function validateEmoji(emoji: string): string | null {
  const trimmed = emoji.trim();
  if (!trimmed) return 'Elige un emoji';
  if (trimmed.length > 16) return 'Usa un solo emoji';
  return null;
}

export const MAX_AMOUNT = 10 ** 12; // igual al límite de la tabla transactions

export function validateAmount(minor: number | null): string | null {
  if (minor === null) return 'Escribe un monto válido';
  if (minor <= 0) return 'El monto debe ser mayor a 0';
  if (minor > MAX_AMOUNT) return 'El monto es demasiado grande';
  return null;
}

export type GroupAllocation = {
  id?: string;
  allocation_type: string; // 'percent' | 'amount'
  allocation_value: number;
};

export function percentTotal(groups: GroupAllocation[]): number {
  return groups
    .filter((g) => g.allocation_type === 'percent')
    .reduce((sum, g) => sum + g.allocation_value, 0);
}

export function validateGroupAllocation(
  group: GroupAllocation,
  allGroups: GroupAllocation[],
): string | null {
  const v = group.allocation_value;
  if (group.allocation_type === 'amount') return v < 0 ? 'El monto no puede ser negativo' : null;
  if (!Number.isInteger(v) || v < 0 || v > 100)
    return 'El porcentaje debe ser un número entero entre 0 y 100';
  const total = percentTotal(allGroups.filter((g) => !group.id || g.id !== group.id)) + v;
  return total > 100 ? `Los porcentajes sumarían ${total} %. El máximo es 100 %` : null;
}
