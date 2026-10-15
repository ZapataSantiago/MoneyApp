import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { ACCOUNT_TYPES, AccountType } from '@/domain/catalog';
import { errorMessage } from '@/domain/errors';
import { CURRENCIES, CurrencyCode, parseAmount } from '@/domain/money';
import { validateName } from '@/domain/validation';
import { supabase } from '@/lib/supabase';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { ChoiceChips } from '@/ui/ChoiceChips';
import { Screen } from '@/ui/Screen';
import { Section, Row } from '@/ui/Section';
import { TextField } from '@/ui/TextField';

const CURRENCY_OPTIONS = (Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => ({
  value: code,
  label: code,
}));
const TYPE_OPTIONS = ACCOUNT_TYPES.map((t) => ({ value: t.value, label: `${t.emoji} ${t.label}` }));

export default function Onboarding() {
  const { profile, refreshProfile } = useAuth();
  const [currency, setCurrency] = useState<CurrencyCode>('COP');
  const [accountName, setAccountName] = useState('Efectivo');
  const [accountType, setAccountType] = useState<AccountType>('cash');
  const [balance, setBalance] = useState('0');
  const [errors, setErrors] = useState<{ name?: string | null; balance?: string | null; submit?: string }>({});
  const [saving, setSaving] = useState(false);

  async function start() {
    const amount = parseAmount(balance, currency);
    const next = {
      name: validateName(accountName),
      balance: amount === null ? 'Escribe un monto válido, por ejemplo 150.000' : null,
    };
    setErrors(next);
    if (next.name || next.balance) return;

    setSaving(true); // el botón queda deshabilitado: evita el doble toque
    try {
      const { error } = await supabase.rpc('complete_onboarding', {
        p_main_currency: currency,
        p_account_name: accountName.trim(),
        p_account_type: accountType,
        p_initial_balance: amount!,
      });
      // Si ya estaba hecho (p. ej. doble toque en otra pantalla), igual seguimos.
      if (error && !error.message.includes('already_onboarded')) throw error;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await refreshProfile(); // el layout navega a las pestañas
    } catch (e) {
      setErrors({ submit: errorMessage(e) });
      setSaving(false);
    }
  }

  return (
    <Screen title={`Hola${profile?.name ? `, ${profile.name}` : ''} 👋`}>
      <AppText color="secondary">Configuremos tu app en un minuto.</AppText>

      <AppText variant="headline">💱 Moneda principal</AppText>
      <AppText variant="footnote" color="secondary">
        Tus resúmenes se mostrarán en esta moneda. {CURRENCIES[currency].name}.
      </AppText>
      <ChoiceChips options={CURRENCY_OPTIONS} value={currency} onChange={setCurrency} />

      <AppText variant="headline">👛 Tu primera cuenta</AppText>
      <ChoiceChips options={TYPE_OPTIONS} value={accountType} onChange={setAccountType} />
      <TextField label="Nombre" value={accountName} onChangeText={setAccountName} error={errors.name} />
      <TextField
        label={`Saldo actual (${currency})`}
        value={balance}
        onChangeText={setBalance}
        keyboardType="numbers-and-punctuation"
        error={errors.balance}
      />

      <Section title="Te crearemos estos grupos" footer="Puedes cambiarlos cuando quieras en Ajustes.">
        <Row emoji="🏠" title="Fijos" detail="50 %" />
        <Row emoji="🎉" title="Variables" detail="30 %" />
        <Row emoji="🐷" title="Ahorro" detail="20 %" />
      </Section>

      {errors.submit ? <AppText color="red">{errors.submit}</AppText> : null}
      <Button title="Empezar" onPress={start} loading={saving} />
    </Screen>
  );
}
