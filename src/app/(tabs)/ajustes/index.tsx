import { router } from 'expo-router';
import { useAuth } from '@/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { confirmAction } from '@/ui/dialogs';
import { Screen } from '@/ui/Screen';
import { Row, Section } from '@/ui/Section';

export default function Ajustes() {
  const { profile, session } = useAuth();

  async function signOut() {
    if (await confirmAction('Cerrar sesión', '¿Seguro que quieres salir?', 'Salir')) supabase.auth.signOut();
  }

  return (
    <Screen title="Ajustes">
      <Section>
        <Row emoji="🙂" title={profile?.name || 'Sin nombre'} detail={session?.user.email} />
      </Section>
      <Section>
        <Row emoji="👛" title="Cuentas" onPress={() => router.push('/ajustes/cuentas')} />
        <Row emoji="🧩" title="Grupos" onPress={() => router.push('/ajustes/grupos')} />
        <Row emoji="🏷️" title="Categorías" onPress={() => router.push('/ajustes/categorias')} />
      </Section>
      <Section>
        <Row title="Cerrar sesión" destructive onPress={signOut} />
      </Section>
    </Screen>
  );
}
