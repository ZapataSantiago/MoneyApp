const AUTH_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Correo o contraseña incorrectos',
  user_already_exists: 'Ya existe una cuenta con ese correo',
  email_exists: 'Ya existe una cuenta con ese correo',
  weak_password: 'La contraseña es muy débil (mínimo 8 caracteres)',
  email_not_confirmed: 'Confirma tu correo antes de entrar',
  over_request_rate_limit: 'Demasiados intentos. Espera un momento',
  over_email_send_rate_limit: 'Demasiados intentos. Espera un momento',
};

/** Convierte cualquier error (Supabase, red, etc.) en un mensaje para el usuario. */
export function errorMessage(err: unknown): string {
  const e = (err ?? {}) as { code?: string; message?: string };
  if (e.code && AUTH_MESSAGES[e.code]) return AUTH_MESSAGES[e.code];
  const msg = e.message ?? '';
  if (/network request failed|failed to fetch/i.test(msg))
    return 'Sin conexión. Revisa tu internet e intenta de nuevo';
  if (msg.includes('already_onboarded')) return 'Ya completaste la configuración inicial';
  if (msg.includes('in_use'))
    return 'No se puede eliminar porque tiene movimientos. Cambia o elimina esos movimientos primero';
  return 'Algo salió mal. Intenta de nuevo';
}
