import { Platform, Text, TextProps } from 'react-native';
import { useTheme } from '@/theme/colors';

type Weight = 'regular' | 'semibold' | 'bold';
const VARIANTS = {
  largeTitle: { fontSize: 34, lineHeight: 41, weight: 'bold' as Weight },
  title: { fontSize: 22, lineHeight: 28, weight: 'semibold' as Weight },
  headline: { fontSize: 17, lineHeight: 22, weight: 'semibold' as Weight },
  body: { fontSize: 17, lineHeight: 22, weight: 'regular' as Weight },
  footnote: { fontSize: 13, lineHeight: 18, weight: 'regular' as Weight },
};
const INTER: Record<Weight, string> = {
  regular: 'Inter_400Regular',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};
const IOS_WEIGHT = { regular: '400', semibold: '600', bold: '700' } as const;

// En iOS la fuente del sistema (SF Pro); en Android, Inter.
export function fontFor(weight: Weight) {
  return Platform.OS === 'ios' ? { fontWeight: IOS_WEIGHT[weight] } : { fontFamily: INTER[weight] };
}

type Props = TextProps & {
  variant?: keyof typeof VARIANTS;
  color?: 'text' | 'secondary' | 'accent' | 'red' | 'green';
};

export function AppText({ variant = 'body', color = 'text', style, ...props }: Props) {
  const c = useTheme();
  const { weight, ...size } = VARIANTS[variant];
  return <Text style={[size, fontFor(weight), { color: c[color] }, style]} {...props} />;
}
