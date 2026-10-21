import { amountToInput, formatMoney, parseAmount } from '@/domain/money';

const norm = (s: string) => s.replace(/\s/g, ' ');

describe('parseAmount', () => {
  it('lee miles al estilo colombiano', () => {
    expect(parseAmount('1.500.000', 'COP')).toBe(1500000);
    expect(parseAmount('25.000', 'COP')).toBe(25000);
    expect(parseAmount('25,000', 'COP')).toBe(25000);
  });
  it('lee números sin separadores, con espacios o signo $', () => {
    expect(parseAmount('25000', 'COP')).toBe(25000);
    expect(parseAmount(' $ 25000 ', 'COP')).toBe(25000);
    expect(parseAmount('0', 'COP')).toBe(0);
  });
  it('lee decimales y los pasa a centavos', () => {
    expect(parseAmount('12,50', 'USD')).toBe(1250);
    expect(parseAmount('12.5', 'USD')).toBe(1250);
    expect(parseAmount('1.234,56', 'USD')).toBe(123456);
    expect(parseAmount('1,234.56', 'USD')).toBe(123456);
  });
  it('acepta negativos (deuda de tarjeta)', () => {
    expect(parseAmount('-200.000', 'COP')).toBe(-200000);
  });
  it('rechaza entradas inválidas', () => {
    expect(parseAmount('', 'COP')).toBeNull();
    expect(parseAmount('-', 'COP')).toBeNull();
    expect(parseAmount('abc', 'COP')).toBeNull();
    expect(parseAmount('25,5', 'COP')).toBeNull(); // COP no tiene decimales
    expect(parseAmount('12,345', 'USD')).toBe(1234500); // grupo de 3 = miles
    expect(parseAmount('1,2,3', 'USD')).toBeNull();
    expect(parseAmount('1.2,3.4', 'USD')).toBeNull();
  });
});

describe('formatMoney', () => {
  it('formatea en es-CO', () => {
    expect(norm(formatMoney(1500000, 'COP'))).toBe('$ 1.500.000');
    expect(norm(formatMoney(-25000, 'COP'))).toBe('-$ 25.000');
    expect(norm(formatMoney(1250, 'USD'))).toBe('US$ 12,50');
  });
});

describe('amountToInput', () => {
  it('devuelve el monto listo para editar', () => {
    expect(amountToInput(25000, 'COP')).toBe('25000');
    expect(amountToInput(1250, 'USD')).toBe('12,50');
    expect(amountToInput(-5, 'USD')).toBe('-0,05');
  });
  it('es inverso de parseAmount', () => {
    expect(parseAmount(amountToInput(123456, 'USD'), 'USD')).toBe(123456);
  });
});
