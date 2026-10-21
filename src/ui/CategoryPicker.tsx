import * as Haptics from 'expo-haptics';
import { Pressable, View } from 'react-native';
import type { Category } from '@/data/categories';
import { useTheme } from '@/theme/colors';
import { AppText } from './AppText';
import { CategoryBadge } from './CategoryBadge';

type Props = { categories: Category[]; value: string | null; onChange: (id: string) => void };

export function CategoryPicker({ categories, value, onChange }: Props) {
  const c = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {categories.map((cat) => {
        const selected = cat.id === value;
        return (
          <Pressable
            key={cat.id}
            accessibilityRole="button"
            accessibilityLabel={cat.name}
            accessibilityState={{ selected }}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(cat.id);
            }}
            style={({ pressed }) => ({
              width: 76,
              minHeight: 76,
              alignItems: 'center',
              gap: 4,
              paddingVertical: 8,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: selected ? c.accent : 'transparent',
              backgroundColor: pressed ? c.fill : c.card,
            })}
          >
            <CategoryBadge emoji={cat.emoji} color={cat.color} size={36} />
            <AppText variant="footnote" numberOfLines={1} style={{ maxWidth: 68 }}>
              {cat.name}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
