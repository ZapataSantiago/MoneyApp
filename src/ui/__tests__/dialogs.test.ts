import { Alert } from 'react-native';
import { confirmAction, notify } from '@/ui/dialogs';

describe('confirmAction', () => {
  afterEach(() => jest.restoreAllMocks());

  it('en web usa window.confirm', async () => {
    const confirm = jest.fn(() => true);
    (globalThis as { window?: unknown }).window = { confirm, alert: jest.fn() };
    await expect(confirmAction('Eliminar', '¿Seguro?', 'Eliminar', 'web')).resolves.toBe(true);
    expect(confirm).toHaveBeenCalledWith('Eliminar\n\n¿Seguro?');
  });

  it('en el teléfono usa Alert y resuelve true al confirmar', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => {
      buttons?.find((b) => b.style === 'destructive')?.onPress?.();
    });
    await expect(confirmAction('Eliminar', '¿Seguro?', 'Eliminar', 'ios')).resolves.toBe(true);
  });

  it('en el teléfono resuelve false al cancelar', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => {
      buttons?.find((b) => b.style === 'cancel')?.onPress?.();
    });
    await expect(confirmAction('Eliminar', '¿Seguro?', 'Eliminar', 'android')).resolves.toBe(false);
  });
});

describe('notify', () => {
  it('en web usa window.alert', () => {
    const alert = jest.fn();
    (globalThis as { window?: unknown }).window = { confirm: jest.fn(), alert };
    notify('No se pudo guardar', 'Sin conexión', 'web');
    expect(alert).toHaveBeenCalledWith('No se pudo guardar\n\nSin conexión');
  });
});
