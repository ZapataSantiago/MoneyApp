import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable } from 'react-native';
import { useTheme } from '@/theme/colors';
import { AppText } from './AppText';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'filled' | 'plain' | 'destructive';
  loading?: boolean;
  disabled?: boolean;
};

export function Button({ title, onPress, variant = 'filled', loading, disabled }: Props) {
  const c = useTheme();
  const off = disabled || loading;
  const filled = variant === 'filled';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={off}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => ({
        backgroundColor: filled ? c.accentFill : 'transparent',
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: 'center',
        opacity: off ? 0.5 : pressed ? 0.7 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator color={filled ? c.onAccent : c.accent} />
      ) : (
        <AppText
          variant="headline"
          style={{ color: filled ? c.onAccent : variant === 'destructive' ? c.red : c.accent }}
        >
          {title}
        </AppText>
      )}
    </Pressable>
  );
}
