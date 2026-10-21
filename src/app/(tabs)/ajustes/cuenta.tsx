import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/auth/AuthProvider';
import { deleteAccount, getAccount, saveAccount } from '@/data/accounts';
import { ACCOUNT_TYPES, AccountType } from '@/domain/catalog';
import { errorMessage } from '@/domain/errors';
import { amountToInput, CURRENCIES, CurrencyCode, parseAmount } from '@/domain/money';
import { validateName } from '@/domain/validation';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { ChoiceChips } from '@/ui/ChoiceChips';
import { Screen } from '@/ui/Screen';
import { TextField } from '@/ui/TextField';

const TYPE_OPTIONS = ACCOUNT_TYPES.map((t) => ({ value: t.value, label: `${t.emoji} ${t.label}` }));
const CURRENCY_OPTIONS = (Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => ({ value: c, label: c }));

export default function CuentaForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { profile } = useAuth();
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [currency, setCurrency] = useState<CurrencyCode>((profile?.main_currency ?? 'COP') as CurrencyCode);
  const [balance, setBalance] = useState('0');
  const [errors, setErrors] = useState<{ name?: string | null; balance?: string | null }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getAccount(id)
      .then((a) => {
        setName(a.name);
        setType(a.type as AccountType);
        setCurrency(a.currency as CurrencyCode);
        setBalance(amountToInput(a.initial_balance, a.currency as CurrencyCode));
      })
      .catch((e) => Alert.alert('No se pudo cargar', errorMessage(e)));
  }, [id]);

  async function save() {
    const amount = parseAmount(balance, currency);
    const next = { name: validateName(name), balance: amount === null ? 'Escribe un monto válido' : null };
    setErrors(next);
    if (next.name || next.balance) return;
    setSaving(true);
    try {
      await saveAccount({ name: name.trim(), type, currency, initial_balance: amount! }, id);
      router.back();
    } catch (e) {
      Alert.alert('No se pudo guardar', errorMessage(e));
      setSaving(false);
    }
  }

  function remove() {
    Alert.alert('Eliminar cuenta', `¿Eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAccount(id!);
            router.back();
          } catch (e) {
            Alert.alert('No se pudo eliminar', errorMessage(e));
          }
        },
      },
    ]);
  }

  return (
    <Screen underHeader>
      <ChoiceChips options={TYPE_OPTIONS} value={type} onChange={setType} />
      <TextField label="Nombre" value={name} onChangeText={setName} placeholder="Ej. Nequi" error={errors.name} />
      <AppText variant="footnote" color="secondary">MONEDA</AppText>
      <ChoiceChips options={CURRENCY_OPTIONS} value={currency} onChange={setCurrency} />
      <TextField
        label={`Saldo inicial (${currency})`}
        value={balance}
        onChangeText={setBalance}
        keyboardType="numbers-and-punctuation"
        error={errors.balance}
      />
      <Button title="Guardar" onPress={save} loading={saving} />
      {id ? <Button title="Eliminar cuenta" variant="destructive" onPress={remove} /> : null}
    </Screen>
  );
}
