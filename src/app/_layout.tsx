import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '@/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/colors';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_600SemiBold, Inter_700Bold });
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <Root fontsLoaded={fontsLoaded} />
    </AuthProvider>
  );
}

function Root({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { status, error, refreshProfile } = useAuth();
  const c = useTheme();

  if (!fontsLoaded || status === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: c.background }}>
        <ActivityIndicator color={c.accent} />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 16, backgroundColor: c.background }}>
        <AppText variant="title" style={{ textAlign: 'center' }}>📡 No pudimos cargar tu perfil</AppText>
        <AppText color="secondary" style={{ textAlign: 'center' }}>{error}</AppText>
        <Button title="Reintentar" onPress={refreshProfile} />
        <Button title="Cerrar sesión" variant="plain" onPress={() => supabase.auth.signOut()} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.background } }}>
      <Stack.Protected guard={status === 'signedOut'}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'onboarding'}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'ready'}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="movimiento"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.92],
            sheetGrabberVisible: true,
            sheetCornerRadius: 24,
            headerShown: false,
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}
