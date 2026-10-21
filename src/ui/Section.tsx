import { Children, ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme/colors';
import { AppText } from './AppText';

export function Section({ title, footer, children }: { title?: string; footer?: string; children: ReactNode }) {
  const c = useTheme();
  const rows = Children.toArray(children);
  return (
    <View style={{ gap: 6 }}>
      {title ? (
        <AppText variant="footnote" color="secondary" style={{ marginLeft: 16 }}>
          {title.toUpperCase()}
        </AppText>
      ) : null}
      <View style={{ backgroundColor: c.card, borderRadius: 16, overflow: 'hidden' }}>
        {rows.map((row, i) => (
          <View key={i}>
            {/* Solo la línea va con sangría, como en iOS; la fila ocupa todo el ancho */}
            {i > 0 ? <View style={{ height: 0.5, backgroundColor: c.separator, marginLeft: 16 }} /> : null}
            {row}
          </View>
        ))}
      </View>
      {footer ? (
        <AppText variant="footnote" color="secondary" style={{ marginHorizontal: 16 }}>
          {footer}
        </AppText>
      ) : null}
    </View>
  );
}

type RowProps = {
  title: string;
  emoji?: string;
  detail?: string;
  color?: string; // punto de color a la izquierda
  destructive?: boolean;
  onPress?: () => void;
};

export function Row({ title, emoji, detail, color, destructive, onPress }: RowProps) {
  const c = useTheme();
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 13,
        backgroundColor: pressed ? c.fill : 'transparent',
      })}
    >
      {color ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} /> : null}
      {emoji ? <AppText style={{ fontSize: 22 }}>{emoji}</AppText> : null}
      <AppText style={{ flex: 1 }} color={destructive ? 'red' : 'text'}>
        {title}
      </AppText>
      {detail ? <AppText color="secondary">{detail}</AppText> : null}
      {onPress && !destructive ? <AppText color="secondary">›</AppText> : null}
    </Pressable>
  );
}
