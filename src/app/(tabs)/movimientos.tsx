import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useAuth } from '@/auth/AuthProvider';
import { loadMonth } from '@/data/ledger';
import { useFocusQuery } from '@/data/useFocusQuery';
import { currentYearMonth, formatDayLabel, monthLabel, monthRange, shiftMonth } from '@/domain/dates';
import { groupByDay, inCurrency, summarizeMonth } from '@/domain/ledger';
import { CurrencyCode, formatMoney } from '@/domain/money';
import { useTheme } from '@/theme/colors';
import { AppText } from '@/ui/AppText';
import { ChoiceChips } from '@/ui/ChoiceChips';
import { EmptyState } from '@/ui/EmptyState';
import { Fab } from '@/ui/Fab';
import { MovementRow } from '@/ui/MovementRow';
import { Screen } from '@/ui/Screen';
import { Section } from '@/ui/Section';

type Filter = 'all' | 'expense' | 'income';
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'expense', label: 'Gastos' },
  { value: 'income', label: 'Ingresos' },
];

export default function Movimientos() {
  const { profile } = useAuth();
  const main = (profile?.main_currency ?? 'COP') as CurrencyCode;
  const [month, setMonth] = useState(currentYearMonth());
  const [filter, setFilter] = useState<Filter>('all');

  const load = useCallback(() => loadMonth(monthRange(month)), [month]);
  const { data, error } = useFocusQuery(load);

  const summary = useMemo(
    () =>
      data
        ? summarizeMonth(inCurrency(data.transactions, data.accounts, main), data.categories, data.groups)
        : null,
    [data, main],
  );
  const days = useMemo(
    () => groupByDay((data?.transactions ?? []).filter((t) => filter === 'all' || t.kind === filter)),
    [data, filter],
  );

  const changeMonth = (delta: number) => {
    Haptics.selectionAsync();
    setMonth((m) => shiftMonth(m, delta));
  };
  const openNew = () => router.push('/movimiento');

  return (
    <View style={{ flex: 1 }}>
      <Screen title="Movimientos">
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <MonthButton icon="chevron-back" label="Mes anterior" onPress={() => changeMonth(-1)} />
          <AppText variant="headline">{monthLabel(month)}</AppText>
          <MonthButton icon="chevron-forward" label="Mes siguiente" onPress={() => changeMonth(1)} />
        </View>

        {summary ? (
          <AppText color="secondary" style={{ textAlign: 'center' }}>
            Ingresos{' '}
            <AppText color="green">+{formatMoney(summary.income, main)}</AppText>
            {'  ·  '}Gastos <AppText>-{formatMoney(summary.expense, main)}</AppText>
          </AppText>
        ) : null}

        <ChoiceChips options={FILTERS} value={filter} onChange={setFilter} />

        {error ? <AppText color="red">{error}</AppText> : null}

        {data && days.length === 0 ? (
          <EmptyState
            emoji="📭"
            title="Sin movimientos este mes"
            message="Cuando registres un gasto o un ingreso aparecerá aquí."
            actionLabel="Registrar movimiento"
            onAction={openNew}
          />
        ) : null}

        {data
          ? days.map((day) => (
              <Section key={day.date} title={formatDayLabel(day.date)}>
                {day.items.map((t) => (
                  <MovementRow
                    key={t.id}
                    transaction={t}
                    category={data.categories.find((cat) => cat.id === t.category_id)}
                    account={data.accounts.find((a) => a.id === t.account_id)}
                    onPress={() => router.push({ pathname: '/movimiento', params: { id: t.id } })}
                  />
                ))}
              </Section>
            ))
          : null}
      </Screen>
      <Fab label="Registrar movimiento" onPress={openNew} />
    </View>
  );

}

function MonthButton({ icon, label, onPress }: { icon: 'chevron-back' | 'chevron-forward'; label: string; onPress: () => void }) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: pressed ? c.fill : 'transparent',
      })}
    >
      <Ionicons name={icon} size={24} color={c.accent} />
    </Pressable>
  );
}
