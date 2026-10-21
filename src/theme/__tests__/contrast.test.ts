import { darkColors, lightColors } from '@/theme/colors';

// Razón de contraste WCAG 2.x entre dos colores hex (#RRGGBB).
function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe.each([
  ['claro', lightColors],
  ['oscuro', darkColors],
])('tema %s', (_name, c) => {
  const textTokens = ['text', 'secondary', 'accent', 'green', 'red'] as const;
  it.each(textTokens)('%s se lee sobre tarjeta y fondo (≥ 4.5:1)', (token) => {
    expect(contrast(c[token], c.card)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c[token], c.background)).toBeGreaterThanOrEqual(4.5);
  });
  it('el texto sobre botones rellenos se lee (≥ 4.5:1)', () => {
    expect(contrast(c.onAccent, c.accentFill)).toBeGreaterThanOrEqual(4.5);
  });
  it('los botones rellenos se distinguen del fondo (≥ 3:1)', () => {
    expect(contrast(c.accentFill, c.background)).toBeGreaterThanOrEqual(3);
  });
});
