import { TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '@/theme/colors';
import { AppText, fontFor } from './AppText';

type Props = TextInputProps & { label: string; error?: string | null };

export function TextField({ label, error, style, ...props }: Props) {
  const c = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <AppText variant="footnote" color="secondary" style={{ marginLeft: 4 }}>
        {label.toUpperCase()}
      </AppText>
      <TextInput
        placeholderTextColor={c.secondary}
        style={[
          fontFor('regular'),
          {
            backgroundColor: c.card,
            color: c.text,
            fontSize: 17,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 13,
          },
          style,
        ]}
        {...props}
      />
      {error ? (
        <AppText variant="footnote" color="red" style={{ marginLeft: 4 }}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
