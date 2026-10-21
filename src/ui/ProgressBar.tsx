import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/theme/colors';

type Props = { value: number; color: string; height?: number };

/** Barra de 0 a 1 que se llena con scaleX (sin animar el ancho). */
export function ProgressBar({ value, color, height = 6 }: Props) {
  const c = useTheme();
  const reduceMotion = useReducedMotion();
  const target = Math.min(Math.max(value, 0), 1);
  const progress = useSharedValue(reduceMotion ? target : 0);

  useEffect(() => {
    progress.value = reduceMotion
      ? target
      : withTiming(target, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, [target, reduceMotion, progress]);

  const fill = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(target * 100) }}
      style={{ height, borderRadius: height / 2, backgroundColor: c.fill, overflow: 'hidden' }}
    >
      <Animated.View
        style={[{ flex: 1, borderRadius: height / 2, backgroundColor: color, transformOrigin: 'left' }, fill]}
      />
    </View>
  );
}
