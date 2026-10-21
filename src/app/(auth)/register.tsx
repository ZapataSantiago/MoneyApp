import { Link } from 'expo-router';
import { useState } from 'react';
import { errorMessage } from '@/domain/errors';
import { validateCredentials, validateName } from '@/domain/validation';
import { supabase } from '@/lib/supabase';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { TextField } from '@/ui/TextField';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    const invalid = validateName(name) ?? validateCredentials(email, password);
    if (invalid) return setError(invalid);
    setError(null);
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim() } },
      });
      if (authError) setError(errorMessage(authError));
      else if (!data.session) setInfo('Revisa tu correo para confirmar la cuenta y luego entra. 📬');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="Crear cuenta ✨">
      <TextField label="Nombre" value={name} onChangeText={setName} autoComplete="name" />
      <TextField label="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
      <TextField label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" error={error} />
      {info ? <AppText color="green">{info}</AppText> : null}
      <Button title="Crear cuenta" onPress={submit} loading={loading} />
      <Link href="/login" asChild>
        <AppText color="accent" style={{ textAlign: 'center' }}>¿Ya tienes cuenta? Entra</AppText>
      </Link>
    </Screen>
  );
}
