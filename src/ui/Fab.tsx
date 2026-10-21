import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/colors';

type Props = { label: string; onPress: () => void };

/** Botón flotante "+" sobre la barra de pestañas. */
export function Fab({ label, onPress }: Props) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      style={({ pressed }) => ({
        position: 'absolute',
        right: 16,
        // ponytail: alto fijo de la barra de pestañas (49); medirla si cambia
        bottom: insets.bottom + 49 + 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: c.accentFill,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.8 : 1,
        shadowColor: '#000000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      })}
    >
      <Ionicons name="add" size={30} color={c.onAccent} />
    </Pressable>
  );
}
