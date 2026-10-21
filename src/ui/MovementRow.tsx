import { Pressable, View } from 'react-native';
import type { Account } from '@/data/accounts';
import type { Category } from '@/data/categories';
import type { Transaction } from '@/data/transactions';
import { CurrencyCode, formatMoney } from '@/domain/money';
import { useTheme } from '@/theme/colors';
import { AppText } from './AppText';
import { CategoryBadge } from './CategoryBadge';

type Props = { transaction: Transaction; category?: Category; account?: Account; onPress: () => void };

export function MovementRow({ transaction: t, category, account, onPress }: Props) {
  const c = useTheme();
  const income = t.kind === 'income';
  const money = formatMoney(t.amount, (account?.currency ?? 'COP') as CurrencyCode);
  const categoryName = category?.name ?? 'Sin categoría';
  const title = t.note || categoryName;
  const subtitle = [categoryName, account?.name].filter(Boolean).join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${income ? 'Ingreso' : 'Gasto'} de ${money} en ${categoryName}${account ? `, cuenta ${account.name}` : ''}`}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: 56,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: pressed ? c.fill : 'transparent',
      })}
    >
      <CategoryBadge emoji={category?.emoji ?? '❔'} color={category?.color ?? c.secondary} />
      <View style={{ flex: 1 }}>
        <AppText numberOfLines={1}>{title}</AppText>
        <AppText variant="footnote" color="secondary" numberOfLines={1}>
          {subtitle}
        </AppText>
      </View>
      <AppText variant="headline" color={income ? 'green' : 'text'}>
        {income ? `+${money}` : `-${money}`}
      </AppText>
    </Pressable>
  );
}
