import { useColorScheme } from 'react-native';

const light = {
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: '#000000',
  secondary: '#8E8E93',
  separator: '#C6C6C8',
  fill: '#E5E5EA',
  accent: '#007AFF',
  green: '#34C759',
  red: '#FF3B30',
};

const dark: typeof light = {
  background: '#000000',
  card: '#1C1C1E',
  text: '#FFFFFF',
  secondary: '#8E8E93',
  separator: '#38383A',
  fill: '#2C2C2E',
  accent: '#0A84FF',
  green: '#30D158',
  red: '#FF453A',
};

export type Colors = typeof light;

export function useTheme(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}
