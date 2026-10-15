import {
  percentTotal,
  validateCredentials,
  validateEmoji,
  validateGroupAllocation,
  validateName,
} from '@/domain/validation';

describe('validateName', () => {
  it('exige texto', () => expect(validateName('   ')).toBe('Escribe un nombre'));
  it('máximo 40 caracteres', () => expect(validateName('a'.repeat(41))).toBe('Máximo 40 caracteres'));
  it('acepta un nombre normal', () => expect(validateName('Nequi')).toBeNull());
});

describe('validateCredentials', () => {
  it('rechaza correo inválido', () =>
    expect(validateCredentials('ana@', '12345678')).toBe('Escribe un correo válido'));
  it('rechaza contraseña corta', () =>
    expect(validateCredentials('ana@mail.com', '1234567')).toBe(
      'La contraseña debe tener mínimo 8 caracteres',
    ));
  it('acepta datos válidos', () => expect(validateCredentials(' ana@mail.com ', '12345678')).toBeNull());
});

describe('validateEmoji', () => {
  it('exige un emoji', () => expect(validateEmoji(' ')).toBe('Elige un emoji'));
  it('acepta un emoji', () => expect(validateEmoji('🍔')).toBeNull());
});

describe('validateGroupAllocation', () => {
  const groups = [
    { id: 'a', allocation_type: 'percent', allocation_value: 50 },
    { id: 'b', allocation_type: 'percent', allocation_value: 30 },
    { id: 'c', allocation_type: 'amount', allocation_value: 500000 },
  ];

  it('suma solo los porcentajes', () => expect(percentTotal(groups)).toBe(80));

  it('rechaza si los porcentajes pasan de 100', () =>
    expect(
      validateGroupAllocation({ allocation_type: 'percent', allocation_value: 25 }, groups),
    ).toBe('Los porcentajes sumarían 105 %. El máximo es 100 %'));

  it('al editar no cuenta el valor anterior del mismo grupo', () =>
    expect(
      validateGroupAllocation({ id: 'a', allocation_type: 'percent', allocation_value: 70 }, groups),
    ).toBeNull());

  it('rechaza porcentajes fuera de 0–100 o con decimales', () => {
    expect(validateGroupAllocation({ allocation_type: 'percent', allocation_value: 101 }, [])).toBe(
      'El porcentaje debe ser un número entero entre 0 y 100',
    );
    expect(validateGroupAllocation({ allocation_type: 'percent', allocation_value: 2.5 }, [])).toBe(
      'El porcentaje debe ser un número entero entre 0 y 100',
    );
  });

  it('rechaza montos negativos', () =>
    expect(validateGroupAllocation({ allocation_type: 'amount', allocation_value: -1 }, [])).toBe(
      'El monto no puede ser negativo',
    ));
});
