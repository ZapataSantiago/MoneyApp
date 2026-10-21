import * as Haptics from 'expo-haptics';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme/colors';
import { AppText } from './AppText';

type Props<T extends string> = {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
};

export function ChoiceChips<T extends string>({ options, value, onChange }: Props<T>) {
  const c = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(o.value);
            }}
            style={{
              backgroundColor: selected ? c.accentFill : c.card,
              borderRadius: 999,
              paddingHorizontal: 14,
              paddingVertical: 8,
            }}
          >
            <AppText style={{ color: selected ? c.onAccent : c.text }}>{o.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
