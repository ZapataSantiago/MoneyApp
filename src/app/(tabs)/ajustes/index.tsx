import { router } from 'expo-router';
import { Alert } from 'react-native';
import { useAuth } from '@/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Screen } from '@/ui/Screen';
import { Row, Section } from '@/ui/Section';

export default function Ajustes() {
  const { profile, session } = useAuth();

  function signOut() {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  }

  return (
    <Screen title="Ajustes">
      <Section>
        <Row emoji="🙂" title={profile?.name || 'Sin nombre'} detail={session?.user.email} />
      </Section>
      <Section>
        <Row emoji="👛" title="Cuentas" onPress={() => router.push('/ajustes/cuentas')} />
        <Row emoji="🧩" title="Grupos" />
        <Row emoji="🏷️" title="Categorías" />
      </Section>
      <Section>
        <Row title="Cerrar sesión" destructive onPress={signOut} />
      </Section>
    </Screen>
  );
}
