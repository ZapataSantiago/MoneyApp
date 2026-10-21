import { View } from 'react-native';
import { AppText } from './AppText';

type Props = { emoji: string; color: string; size?: number };

/** Emoji de la categoría sobre un círculo de su color (decorativo: el nombre va al lado). */
export function CategoryBadge({ emoji, color, size = 40 }: Props) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: `${color}33`, // 20 % de opacidad
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AppText style={{ fontSize: size * 0.5, lineHeight: size * 0.62 }}>{emoji}</AppText>
    </View>
  );
}
