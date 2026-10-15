import { router } from 'expo-router';
import { useAuth } from '@/auth/AuthProvider';
import { listGroups } from '@/data/groups';
import { useFocusQuery } from '@/data/useFocusQuery';
import { CurrencyCode, formatMoney } from '@/domain/money';
import { percentTotal } from '@/domain/validation';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { Row, Section } from '@/ui/Section';

export default function Grupos() {
  const { profile } = useAuth();
  const currency = (profile?.main_currency ?? 'COP') as CurrencyCode;
  const { data: groups, error } = useFocusQuery(listGroups);
  const total = groups ? percentTotal(groups) : 0;

  return (
    <Screen underHeader>
      {error ? <AppText color="red">{error}</AppText> : null}
      {groups && groups.length > 0 ? (
        <Section footer={`Asignado por porcentaje: ${total} % de tu ingreso.`}>
          {groups.map((g) => (
            <Row
              key={g.id}
              emoji={g.is_fixed ? '📌' : '🔀'}
              title={g.name}
              detail={
                g.allocation_type === 'percent'
                  ? `${g.allocation_value} %`
                  : formatMoney(g.allocation_value, currency)
              }
              onPress={() => router.push({ pathname: '/ajustes/grupo', params: { id: g.id } })}
            />
          ))}
        </Section>
      ) : groups ? (
        <AppText color="secondary">Aún no tienes grupos. 🧩</AppText>
      ) : null}
      <Button title="Agregar grupo" onPress={() => router.push('/ajustes/grupo')} />
    </Screen>
  );
}
