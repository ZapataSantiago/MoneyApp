import { Stack } from 'expo-router';
import { fontFor } from '@/ui/AppText';
import { useTheme } from '@/theme/colors';

export default function AjustesLayout() {
  const c = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.background },
        headerTintColor: c.accent,
        headerTitleStyle: { ...fontFor('semibold'), color: c.text },
        headerShadowVisible: false,
        headerBackTitle: 'Atrás',
        contentStyle: { backgroundColor: c.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="cuentas" options={{ title: 'Cuentas' }} />
      <Stack.Screen name="cuenta" options={{ title: 'Cuenta' }} />
      <Stack.Screen name="grupos" options={{ title: 'Grupos' }} />
      <Stack.Screen name="grupo" options={{ title: 'Grupo' }} />
      <Stack.Screen name="categorias" options={{ title: 'Categorías' }} />
      <Stack.Screen name="categoria" options={{ title: 'Categoría' }} />
    </Stack>
  );
}
