import { router } from 'expo-router';
import { ACCOUNT_TYPES } from '@/domain/catalog';
import { CurrencyCode, formatMoney } from '@/domain/money';
import { listAccounts } from '@/data/accounts';
import { useFocusQuery } from '@/data/useFocusQuery';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { Row, Section } from '@/ui/Section';

export default function Cuentas() {
  const { data: accounts, error } = useFocusQuery(listAccounts);
  return (
    <Screen underHeader>
      {error ? <AppText color="red">{error}</AppText> : null}
      {accounts && accounts.length > 0 ? (
        <Section footer="Saldo inicial. El saldo real aparecerá cuando registres movimientos.">
          {accounts.map((a) => (
            <Row
              key={a.id}
              emoji={ACCOUNT_TYPES.find((t) => t.value === a.type)?.emoji}
              title={a.name}
              detail={formatMoney(a.initial_balance, a.currency as CurrencyCode)}
              onPress={() => router.push({ pathname: '/ajustes/cuenta', params: { id: a.id } })}
            />
          ))}
        </Section>
      ) : accounts ? (
        <AppText color="secondary">Aún no tienes cuentas. 👛</AppText>
      ) : null}
      <Button title="Agregar cuenta" onPress={() => router.push('/ajustes/cuenta')} />
    </Screen>
  );
}
