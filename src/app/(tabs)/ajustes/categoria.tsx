import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { deleteCategory, getCategory, saveCategory } from '@/data/categories';
import { Group, listGroups } from '@/data/groups';
import { CATEGORY_COLORS } from '@/domain/catalog';
import { errorMessage } from '@/domain/errors';
import { validateEmoji, validateName } from '@/domain/validation';
import { useTheme } from '@/theme/colors';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { ChoiceChips } from '@/ui/ChoiceChips';
import { Screen } from '@/ui/Screen';
import { TextField } from '@/ui/TextField';

type Kind = 'expense' | 'income';
const KIND_OPTIONS: { value: Kind; label: string }[] = [
  { value: 'expense', label: '💸 Gasto' },
  { value: 'income', label: '💰 Ingreso' },
];

export default function CategoriaForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const c = useTheme();
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<Kind>('expense');
  const [emoji, setEmoji] = useState('');
  const [color, setColor] = useState(CATEGORY_COLORS[7]);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string | null; emoji?: string | null; group?: string | null }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listGroups().then(setGroups).catch((e) => Alert.alert('No se pudo cargar', errorMessage(e)));
    if (!id) return;
    getCategory(id)
      .then((cat) => {
        setName(cat.name);
        setKind(cat.kind as Kind);
        setEmoji(cat.emoji);
        setColor(cat.color);
        setGroupId(cat.group_id);
      })
      .catch((e) => Alert.alert('No se pudo cargar', errorMessage(e)));
  }, [id]);

  async function save() {
    const next = {
      name: validateName(name),
      emoji: validateEmoji(emoji),
      group: kind === 'expense' && !groupId ? 'Elige un grupo' : null,
    };
    setErrors(next);
    if (next.name || next.emoji || next.group) return;
    setSaving(true);
    try {
      await saveCategory(
        { name: name.trim(), kind, emoji: emoji.trim(), color, group_id: kind === 'expense' ? groupId : null },
        id,
      );
      router.back();
    } catch (e) {
      Alert.alert('No se pudo guardar', errorMessage(e));
      setSaving(false);
    }
  }

  function remove() {
    Alert.alert('Eliminar categoría', `¿Eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCategory(id!);
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
      <View style={{ alignItems: 'center', gap: 8 }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppText style={{ fontSize: 36, lineHeight: 44 }}>{emoji || '❔'}</AppText>
        </View>
      </View>
      <ChoiceChips options={KIND_OPTIONS} value={kind} onChange={setKind} />
      <TextField label="Nombre" value={name} onChangeText={setName} placeholder="Ej. Gimnasio" error={errors.name} />
      <TextField label="Emoji" value={emoji} onChangeText={setEmoji} placeholder="🏋️" error={errors.emoji} />

      <AppText variant="footnote" color="secondary">COLOR</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {CATEGORY_COLORS.map((hex) => (
          <Pressable
            key={hex}
            accessibilityLabel={`Color ${hex}`}
            onPress={() => {
              Haptics.selectionAsync();
              setColor(hex);
            }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: hex,
              borderWidth: hex === color ? 3 : 0,
              borderColor: c.text,
            }}
          />
        ))}
      </View>

      {kind === 'expense' ? (
        <>
          <AppText variant="footnote" color="secondary">GRUPO</AppText>
          <ChoiceChips
            options={groups.map((g) => ({ value: g.id, label: g.name }))}
            value={groupId}
            onChange={setGroupId}
          />
          {errors.group ? <AppText variant="footnote" color="red">{errors.group}</AppText> : null}
        </>
      ) : null}

      <Button title="Guardar" onPress={save} loading={saving} />
      {id ? <Button title="Eliminar categoría" variant="destructive" onPress={remove} /> : null}
    </Screen>
  );
}
