import { Link } from 'expo-router';
import { useState } from 'react';
import { errorMessage } from '@/domain/errors';
import { validateCredentials } from '@/domain/validation';
import { supabase } from '@/lib/supabase';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { TextField } from '@/ui/TextField';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    const invalid = validateCredentials(email, password);
    if (invalid) return setError(invalid);
    setError(null);
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (authError) setError(errorMessage(authError));
      // Si entra, AuthProvider cambia el estado y el layout navega solo.
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="Hola 👋">
      <AppText color="secondary">Entra para ver tus finanzas.</AppText>
      <TextField label="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
      <TextField label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" error={error} />
      <Button title="Entrar" onPress={submit} loading={loading} />
      <Link href="/register" asChild>
        <AppText color="accent" style={{ textAlign: 'center' }}>¿No tienes cuenta? Regístrate</AppText>
      </Link>
    </Screen>
  );
}
