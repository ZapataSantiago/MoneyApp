import { useColorScheme } from 'react-native';

export const lightColors = {
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: '#000000',
  secondary: '#6C6C70',
  separator: '#C6C6C8',
  fill: '#E5E5EA',
  accent: '#0066D6', // texto y enlaces
  accentFill: '#0066D6', // fondo de botones rellenos (con onAccent encima)
  green: '#1F7A36',
  red: '#D70015',
  onAccent: '#FFFFFF',
};

export const darkColors: typeof lightColors = {
  background: '#000000',
  card: '#1C1C1E',
  text: '#FFFFFF',
  secondary: '#8E8E93',
  separator: '#38383A',
  fill: '#2C2C2E',
  accent: '#0A84FF',
  // En oscuro ningún azul sirve a la vez como texto sobre negro y como fondo de texto blanco.
  accentFill: '#0060DF',
  green: '#30D158',
  red: '#FF453A',
  onAccent: '#FFFFFF',
};

export type Colors = typeof lightColors;

export function useTheme(): Colors {
  return useColorScheme() === 'dark' ? darkColors : lightColors;
}
