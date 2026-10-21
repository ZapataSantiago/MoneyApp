import { Alert, Platform } from 'react-native';

// En web, Alert.alert de react-native-web no hace nada: usamos los diálogos del navegador.

/** Pide confirmación; resuelve true si el usuario acepta. */
export function confirmAction(
  title: string,
  message: string,
  confirmLabel: string,
  platform: string = Platform.OS,
): Promise<boolean> {
  if (platform === 'web') return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  return new Promise((resolve) =>
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
    ]),
  );
}

export function notify(title: string, message: string, platform: string = Platform.OS): void {
  if (platform === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}
