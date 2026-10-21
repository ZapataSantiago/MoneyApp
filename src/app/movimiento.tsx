import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, TextInput, View } from 'react-native';
import { Account, listAccounts } from '@/data/accounts';
import { Category, listCategories } from '@/data/categories';
import { deleteTransaction, getTransaction, saveTransaction } from '@/data/transactions';
import { formatDayLabel, toDateString } from '@/domain/dates';
import { errorMessage } from '@/domain/errors';
import { amountToInput, CurrencyCode, parseAmount } from '@/domain/money';
import { validateAmount } from '@/domain/validation';
import { useTheme } from '@/theme/colors';
import { AppText, fontFor } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { CategoryPicker } from '@/ui/CategoryPicker';
import { ChoiceChips } from '@/ui/ChoiceChips';
import { EmptyState } from '@/ui/EmptyState';
import { confirmAction, notify } from '@/ui/dialogs';
import { goBack } from '@/ui/navigation';
import { Screen } from '@/ui/Screen';
import { TextField } from '@/ui/TextField';

type Kind = 'expense' | 'income';
const KIND_OPTIONS: { value: Kind; label: string }[] = [
  { value: 'expense', label: '💸 Gasto' },
  { value: 'income', label: '💰 Ingreso' },
];

const fromDateString = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export default function MovimientoSheet() {
  const params = useLocalSearchParams<{ id?: string; kind?: Kind }>();
  const id = params.id;
  const c = useTheme();
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [kind, setKind] = useState<Kind>(params.kind === 'income' ? 'income' : 'expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [date, setDate] = useState(toDateString(new Date()));
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ amount?: string | null; category?: string | null; date?: string | null }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([listAccounts(), listCategories(), id ? getTransaction(id) : Promise.resolve(null)])
      .then(([accs, cats, t]) => {
        setAccounts(accs);
        setCategories(cats);
        if (t) {
          const acc = accs.find((a) => a.id === t.account_id);
          setKind(t.kind as Kind);
          setAmount(amountToInput(t.amount, (acc?.currency ?? 'COP') as CurrencyCode));
          setCategoryId(t.category_id);
          setAccountId(t.account_id);
          setDate(t.date);
          setNote(t.note);
        } else {
          setAccountId(accs[0]?.id ?? null);
        }
      })
      .catch((e) => notify('No se pudo cargar', errorMessage(e)));
  }, [id]);

  const account = accounts?.find((a) => a.id === accountId);
  const currency = (account?.currency ?? 'COP') as CurrencyCode;
  const kindCategories = useMemo(() => categories.filter((cat) => cat.kind === kind), [categories, kind]);

  const changeKind = (k: Kind) => {
    setKind(k);
    setCategoryId(null);
  };

  const openAndroidDate = useCallback(() => {
    DateTimePickerAndroid.open({
      value: fromDateString(date),
      mode: 'date',
      onValueChange: (_e, d) => setDate(toDateString(d)),
    });
  }, [date]);

  async function save() {
    const minor = parseAmount(amount, currency);
    const next = {
      amount: validateAmount(minor),
      category: categoryId ? null : 'Elige una categoría',
      date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? null : 'Usa el formato AAAA-MM-DD',
    };
    setErrors(next);
    if (next.amount || next.category || next.date || !accountId) return;
    setSaving(true);
    try {
      await saveTransaction(
        { kind, amount: minor!, category_id: categoryId!, account_id: accountId, date, note: note.trim() },
        id,
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      goBack('/');
    } catch (e) {
      notify('No se pudo guardar', errorMessage(e));
      setSaving(false);
    }
  }

  async function remove() {
    if (!(await confirmAction('Eliminar movimiento', '¿Seguro que quieres eliminarlo?', 'Eliminar'))) return;
    try {
      await deleteTransaction(id!);
      goBack('/');
    } catch (e) {
      notify('No se pudo eliminar', errorMessage(e));
    }
  }

  if (accounts && accounts.length === 0) {
    return (
      <Screen underHeader>
        <EmptyState
          emoji="👛"
          title="Primero crea una cuenta"
          message="Necesitas al menos una cuenta (efectivo, banco o tarjeta) para registrar movimientos."
          actionLabel="Ir a Cuentas"
          onAction={() => router.replace('/ajustes/cuentas')}
        />
      </Screen>
    );
  }

  return (
    <Screen underHeader>
      <AppText variant="title">{id ? 'Editar movimiento' : 'Nuevo movimiento'}</AppText>
      <ChoiceChips options={KIND_OPTIONS} value={kind} onChange={changeKind} />

      <View style={{ alignItems: 'center', gap: 4 }}>
        <AppText variant="footnote" color="secondary">
          MONTO ({currency})
        </AppText>
        <TextInput
          accessibilityLabel={`Monto en ${currency}`}
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          placeholderTextColor={c.secondary}
          keyboardType="numbers-and-punctuation"
          autoFocus={!id}
          style={[
            fontFor('bold'),
            { fontSize: 44, color: kind === 'income' ? c.green : c.text, textAlign: 'center', minWidth: 160 },
          ]}
        />
        {errors.amount ? (
          <AppText variant="footnote" color="red">
            {errors.amount}
          </AppText>
        ) : null}
      </View>

      <AppText variant="footnote" color="secondary">
        CATEGORÍA
      </AppText>
      {kindCategories.length > 0 ? (
        <CategoryPicker categories={kindCategories} value={categoryId} onChange={setCategoryId} />
      ) : (
        <EmptyState
          emoji="🏷️"
          title={`No tienes categorías de ${kind === 'income' ? 'ingreso' : 'gasto'}`}
          message="Créalas en Ajustes para poder registrar este movimiento."
          actionLabel="Ir a Categorías"
          onAction={() => router.replace('/ajustes/categorias')}
        />
      )}
      {errors.category ? (
        <AppText variant="footnote" color="red">
          {errors.category}
        </AppText>
      ) : null}

      <AppText variant="footnote" color="secondary">
        CUENTA
      </AppText>
      <ChoiceChips
        options={(accounts ?? []).map((a) => ({ value: a.id, label: a.name }))}
        value={accountId}
        onChange={setAccountId}
      />

      {Platform.OS === 'web' ? (
        // ponytail: el selector nativo no existe en web; campo de texto AAAA-MM-DD solo para pruebas en navegador
        <TextField label="Fecha (AAAA-MM-DD)" value={date} onChangeText={setDate} error={errors.date} />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Fecha: ${formatDayLabel(date)}`}
          disabled={Platform.OS === 'ios'}
          onPress={openAndroidDate}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: c.card,
            borderRadius: 12,
            paddingHorizontal: 16,
            minHeight: 48,
          }}
        >
          <AppText>📅 Fecha</AppText>
          {Platform.OS === 'ios' ? (
            <DateTimePicker
              value={fromDateString(date)}
              mode="date"
              display="compact"
              onValueChange={(_e, d) => setDate(toDateString(d))}
            />
          ) : (
            <AppText color="accent">{formatDayLabel(date)}</AppText>
          )}
        </Pressable>
      )}

      <TextField label="Nota (opcional)" value={note} onChangeText={setNote} maxLength={200} placeholder="Ej. Almuerzo con el equipo" />

      <Button title="Guardar" onPress={save} loading={saving} disabled={!accounts} />
      {id ? <Button title="Eliminar movimiento" variant="destructive" onPress={remove} /> : null}
    </Screen>
  );
}
