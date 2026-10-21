import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { useAuth } from '@/auth/AuthProvider';
import type { Category } from '@/data/categories';
import { loadMonth } from '@/data/ledger';
import { useFocusQuery } from '@/data/useFocusQuery';
import { currentYearMonth, monthRange } from '@/domain/dates';
import { inCurrency, MonthSummary, splitBalances, summarizeMonth } from '@/domain/ledger';
import { CurrencyCode, formatMoney } from '@/domain/money';
import { useTheme } from '@/theme/colors';
import { AppText } from '@/ui/AppText';
import { CategoryBadge } from '@/ui/CategoryBadge';
import { EmptyState } from '@/ui/EmptyState';
import { Fab } from '@/ui/Fab';
import { MovementRow } from '@/ui/MovementRow';
import { ProgressBar } from '@/ui/ProgressBar';
import { Screen } from '@/ui/Screen';
import { Section } from '@/ui/Section';
import { useCountUp } from '@/ui/useCountUp';

const enter = (i: number) => FadeInDown.duration(300).delay(i * 60).reduceMotion(ReduceMotion.System);

export default function Inicio() {
  const c = useTheme();
  const { profile } = useAuth();
  const main = (profile?.main_currency ?? 'COP') as CurrencyCode;
  const month = useMemo(() => currentYearMonth(), []);

  const load = useCallback(() => loadMonth(monthRange(month)), [month]);
  const { data, error } = useFocusQuery(load);

  const balances = data ? splitBalances(data.balances, main) : { total: 0, otherCurrencies: [] };
  const summary = data
    ? summarizeMonth(inCurrency(data.transactions, data.accounts, main), data.categories, data.groups)
    : null;
  const shownTotal = useCountUp(balances.total);
  const openNew = () => router.push('/movimiento');

  return (
    <View style={{ flex: 1 }}>
      <Screen title="Inicio">
        {profile?.name ? (
          <AppText color="secondary" style={{ marginTop: -12 }}>
            Hola, {profile.name} 👋
          </AppText>
        ) : null}

        <Animated.View entering={enter(0)} style={{ backgroundColor: c.card, borderRadius: 24, padding: 24, gap: 16 }}>
          <View style={{ gap: 4 }}>
            <AppText variant="footnote" color="secondary">
              SALDO TOTAL
            </AppText>
            <AppText style={{ fontSize: 40, lineHeight: 48 }} variant="largeTitle" accessibilityLabel={`Saldo total ${formatMoney(balances.total, main)}`}>
              {formatMoney(shownTotal, main)}
            </AppText>
            {balances.otherCurrencies.length > 0 ? (
              <AppText variant="footnote" color="secondary">
                No incluye cuentas en {balances.otherCurrencies.join(', ')}
              </AppText>
            ) : null}
          </View>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Stat label="Ingresos del mes" value={`+${formatMoney(summary?.income ?? 0, main)}`} color="green" />
            <Stat label="Gastos del mes" value={`-${formatMoney(summary?.expense ?? 0, main)}`} color="text" />
          </View>
        </Animated.View>

        {error ? <AppText color="red">{error}</AppText> : null}

        {data && data.transactions.length === 0 ? (
          <Animated.View entering={enter(1)}>
            <EmptyState
              emoji="🌱"
              title="Aún no registras movimientos"
              message="Toca + para registrar tu primer gasto o ingreso."
              actionLabel="Registrar movimiento"
              onAction={openNew}
            />
          </Animated.View>
        ) : null}

        {data && summary && data.transactions.length > 0 ? (
          <>
            <SpendingSection index={1} title="📌 Fijos" fixed summary={summary} categories={data.categories} currency={main} />
            <SpendingSection index={2} title="🔀 Variables" fixed={false} summary={summary} categories={data.categories} currency={main} />

            <Animated.View entering={enter(3)} style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <AppText variant="footnote" color="secondary" style={{ marginLeft: 16 }}>
                  ÚLTIMOS MOVIMIENTOS
                </AppText>
                <Pressable
                  accessibilityRole="link"
                  onPress={() => router.navigate('/movimientos')}
                  hitSlop={12}
                  style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 }}
                >
                  <AppText color="accent">Ver todos</AppText>
                </Pressable>
              </View>
              <Section>
                {data.transactions.slice(0, 5).map((t) => (
                  <MovementRow
                    key={t.id}
                    transaction={t}
                    category={data.categories.find((cat) => cat.id === t.category_id)}
                    account={data.accounts.find((a) => a.id === t.account_id)}
                    onPress={() => router.push({ pathname: '/movimiento', params: { id: t.id } })}
                  />
                ))}
              </Section>
            </Animated.View>
          </>
        ) : null}
      </Screen>
      <Fab label="Registrar movimiento" onPress={openNew} />
    </View>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: 'green' | 'text' }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <AppText variant="footnote" color="secondary">
        {label}
      </AppText>
      <AppText variant="headline" color={color} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </AppText>
    </View>
  );
}

type SpendingProps = {
  index: number;
  title: string;
  fixed: boolean;
  summary: MonthSummary;
  categories: Category[];
  currency: CurrencyCode;
};

function SpendingSection({ index, title, fixed, summary, categories, currency }: SpendingProps) {
  const c = useTheme();
  const rows = summary.byCategory.filter((r) => r.fixed === fixed);
  if (rows.length === 0) return null;
  const total = fixed ? summary.fixedExpense : summary.variableExpense;
  return (
    <Animated.View entering={enter(index)}>
      <Section title={`${title} · ${formatMoney(total, currency)}`}>
        {rows.map((r) => {
          const cat = categories.find((x) => x.id === r.categoryId);
          return (
            <View key={r.categoryId} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
              <CategoryBadge emoji={cat?.emoji ?? '❔'} color={cat?.color ?? c.secondary} />
              <View style={{ flex: 1, gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                  <AppText numberOfLines={1} style={{ flex: 1 }}>
                    {cat?.name ?? 'Sin categoría'}
                  </AppText>
                  <AppText variant="headline">{formatMoney(r.total, currency)}</AppText>
                </View>
                <ProgressBar value={r.share} color={cat?.color ?? c.secondary} />
              </View>
            </View>
          );
        })}
      </Section>
    </Animated.View>
  );
}
