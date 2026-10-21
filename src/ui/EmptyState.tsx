import { View } from 'react-native';
import { useTheme } from '@/theme/colors';
import { AppText } from './AppText';
import { Button } from './Button';

type Props = { emoji: string; title: string; message: string; actionLabel?: string; onAction?: () => void };

export function EmptyState({ emoji, title, message, actionLabel, onAction }: Props) {
  const c = useTheme();
  return (
    <View style={{ backgroundColor: c.card, borderRadius: 16, padding: 24, alignItems: 'center', gap: 8 }}>
      <AppText style={{ fontSize: 40, lineHeight: 48 }} accessibilityElementsHidden>
        {emoji}
      </AppText>
      <AppText variant="headline" style={{ textAlign: 'center' }}>
        {title}
      </AppText>
      <AppText color="secondary" style={{ textAlign: 'center' }}>
        {message}
      </AppText>
      {actionLabel && onAction ? (
        <View style={{ alignSelf: 'stretch', marginTop: 8 }}>
          <Button title={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
