import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Switch, View } from 'react-native';
import { useAuth } from '@/auth/AuthProvider';
import { deleteGroup, getGroup, listGroups, saveGroup } from '@/data/groups';
import { errorMessage } from '@/domain/errors';
import { amountToInput, CurrencyCode, parseAmount } from '@/domain/money';
import { validateGroupAllocation, validateName } from '@/domain/validation';
import { useTheme } from '@/theme/colors';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { ChoiceChips } from '@/ui/ChoiceChips';
import { confirmAction, notify } from '@/ui/dialogs';
import { goBack } from '@/ui/navigation';
import { Screen } from '@/ui/Screen';
import { TextField } from '@/ui/TextField';

type AllocationType = 'percent' | 'amount';
const TYPE_OPTIONS: { value: AllocationType; label: string }[] = [
  { value: 'percent', label: '% del ingreso' },
  { value: 'amount', label: 'Monto fijo' },
];

export default function GrupoForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { profile } = useAuth();
  const c = useTheme();
  const currency = (profile?.main_currency ?? 'COP') as CurrencyCode;
  const [name, setName] = useState('');
  const [allocationType, setAllocationType] = useState<AllocationType>('percent');
  const [value, setValue] = useState('0');
  const [isFixed, setIsFixed] = useState(false);
  const [errors, setErrors] = useState<{ name?: string | null; value?: string | null }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getGroup(id)
      .then((g) => {
        setName(g.name);
        setAllocationType(g.allocation_type as AllocationType);
        setValue(g.allocation_type === 'percent' ? String(g.allocation_value) : amountToInput(g.allocation_value, currency));
        setIsFixed(g.is_fixed);
      })
      .catch((e) => notify('No se pudo cargar', errorMessage(e)));
  }, [id, currency]);

  async function save() {
    const parsed = allocationType === 'percent' ? Number(value.trim()) : parseAmount(value, currency);
    let valueError: string | null = null;
    if (parsed === null || value.trim() === '' || Number.isNaN(parsed)) {
      valueError = 'Escribe un número válido';
    }
    setSaving(true);
    try {
      if (!valueError) {
        const others = await listGroups();
        valueError = validateGroupAllocation(
          { id, allocation_type: allocationType, allocation_value: parsed! },
          others,
        );
      }
      const next = { name: validateName(name), value: valueError };
      setErrors(next);
      if (next.name || next.value) return setSaving(false);
      await saveGroup(
        { name: name.trim(), allocation_type: allocationType, allocation_value: parsed!, is_fixed: isFixed },
        id,
      );
      goBack('/ajustes');
    } catch (e) {
      notify('No se pudo guardar', errorMessage(e));
      setSaving(false);
    }
  }

  async function remove() {
    if (!(await confirmAction('Eliminar grupo', `Las categorías de "${name}" quedarán sin grupo.`, 'Eliminar'))) return;
    try {
      await deleteGroup(id!);
      goBack('/ajustes');
    } catch (e) {
      notify('No se pudo eliminar', errorMessage(e));
    }
  }

  return (
    <Screen underHeader>
      <TextField label="Nombre" value={name} onChangeText={setName} placeholder="Ej. Ocio" error={errors.name} />
      <ChoiceChips options={TYPE_OPTIONS} value={allocationType} onChange={setAllocationType} />
      <TextField
        label={allocationType === 'percent' ? 'Porcentaje (%)' : `Monto (${currency})`}
        value={value}
        onChangeText={setValue}
        keyboardType="numbers-and-punctuation"
        error={errors.value}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: c.card,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 10,
        }}
      >
        <AppText style={{ flex: 1 }}>📌 Es un gasto fijo</AppText>
        <Switch value={isFixed} onValueChange={setIsFixed} trackColor={{ true: c.green }} />
      </View>
      <Button title="Guardar" onPress={save} loading={saving} />
      {id ? <Button title="Eliminar grupo" variant="destructive" onPress={remove} /> : null}
    </Screen>
  );
}
