import Ionicons from '@expo/vector-icons/Ionicons';
import { SymbolView, SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';

type Props = {
  ios: SymbolViewProps['name'];
  android: keyof typeof Ionicons.glyphMap;
  color: ColorValue;
};

// SF Symbols en iOS; Ionicons (estilo iOS) en Android.
export function TabIcon({ ios, android, color }: Props) {
  return (
    <SymbolView
      name={ios}
      tintColor={color}
      size={24}
      fallback={<Ionicons name={android} size={24} color={color} />}
    />
  );
}
