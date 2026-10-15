import { errorMessage } from '@/domain/errors';

describe('errorMessage', () => {
  it('traduce errores de Supabase Auth', () => {
    expect(errorMessage({ code: 'invalid_credentials' })).toBe('Correo o contraseña incorrectos');
    expect(errorMessage({ code: 'user_already_exists' })).toBe('Ya existe una cuenta con ese correo');
    expect(errorMessage({ code: 'email_not_confirmed' })).toBe('Confirma tu correo antes de entrar');
  });
  it('detecta falta de internet', () => {
    expect(errorMessage(new TypeError('Network request failed'))).toBe(
      'Sin conexión. Revisa tu internet e intenta de nuevo',
    );
    expect(errorMessage({ message: 'TypeError: Failed to fetch' })).toBe(
      'Sin conexión. Revisa tu internet e intenta de nuevo',
    );
  });
  it('traduce el onboarding repetido', () =>
    expect(errorMessage({ message: 'already_onboarded' })).toBe('Ya completaste la configuración inicial'));
  it('usa un mensaje genérico para lo desconocido', () => {
    expect(errorMessage({ code: 'otra_cosa', message: 'boom' })).toBe('Algo salió mal. Intenta de nuevo');
    expect(errorMessage(null)).toBe('Algo salió mal. Intenta de nuevo');
  });
});
