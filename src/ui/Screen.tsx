import { ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/colors';
import { AppText } from './AppText';

type Props = { title?: string; underHeader?: boolean; children: ReactNode };

export function Screen({ title, underHeader, children }: Props) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{
        paddingTop: underHeader ? 16 : insets.top + 8,
        // ponytail: espacio fijo para la barra de pestañas flotante; medirla si cambia su alto
        paddingBottom: insets.bottom + 100,
        paddingHorizontal: 16,
        gap: 20,
      }}
      keyboardShouldPersistTaps="handled"
    >
      {title ? <AppText variant="largeTitle">{title}</AppText> : null}
      {children}
    </ScrollView>
  );
}
