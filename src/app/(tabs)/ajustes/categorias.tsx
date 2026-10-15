import { router } from 'expo-router';
import { useCallback } from 'react';
import { listCategories } from '@/data/categories';
import { listGroups } from '@/data/groups';
import { useFocusQuery } from '@/data/useFocusQuery';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { Row, Section } from '@/ui/Section';

export default function Categorias() {
  const load = useCallback(() => Promise.all([listCategories(), listGroups()]), []);
  const { data, error } = useFocusQuery(load);
  const [categories, groups] = data ?? [[], []];
  const groupName = (id: string | null) => groups.find((g) => g.id === id)?.name ?? 'Sin grupo';
  const open = (id: string) => router.push({ pathname: '/ajustes/categoria', params: { id } });

  return (
    <Screen underHeader>
      {error ? <AppText color="red">{error}</AppText> : null}
      <Section title="Gastos">
        {categories
          .filter((cat) => cat.kind === 'expense')
          .map((cat) => (
            <Row key={cat.id} color={cat.color} emoji={cat.emoji} title={cat.name} detail={groupName(cat.group_id)} onPress={() => open(cat.id)} />
          ))}
      </Section>
      <Section title="Ingresos">
        {categories
          .filter((cat) => cat.kind === 'income')
          .map((cat) => (
            <Row key={cat.id} color={cat.color} emoji={cat.emoji} title={cat.name} onPress={() => open(cat.id)} />
          ))}
      </Section>
      <Button title="Agregar categoría" onPress={() => router.push('/ajustes/categoria')} />
    </Screen>
  );
}
