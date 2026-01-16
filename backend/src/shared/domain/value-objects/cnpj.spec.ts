import { describe, it, expect } from '@jest/globals';
import { CNPJ } from './cnpj';

describe('CNPJ Value Object', () => {
  describe('create', () => {
    it('should create valid CNPJ from unformatted string', () => {
      const result = CNPJ.create('11222333000181');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('11.222.333/0001-81');
    });

    it('should create valid CNPJ from formatted string', () => {
      const result = CNPJ.create('11.222.333/0001-81');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('11.222.333/0001-81');
    });

    it('should create valid CNPJ from partially formatted string', () => {
      const result = CNPJ.create('11222333/0001-81');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('11.222.333/0001-81');
    });

    it('should create valid CNPJ with another valid number', () => {
      const result = CNPJ.create('34028316000103');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('34.028.316/0001-03');
    });

    it('should fail with empty string', () => {
      const result = CNPJ.create('');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('CNPJ cannot be empty');
    });

    it('should fail with undefined', () => {
      const result = CNPJ.create(undefined);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('CNPJ cannot be empty');
    });

    it('should fail with whitespace only', () => {
      const result = CNPJ.create('   ');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('CNPJ cannot be empty');
    });

    it('should fail with less than 14 digits', () => {
      const result = CNPJ.create('1122233300018');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('CNPJ must have exactly 14 digits');
    });

    it('should fail with more than 14 digits', () => {
      const result = CNPJ.create('112223330001811');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('CNPJ must have exactly 14 digits');
    });

    it('should fail with all digits the same', () => {
      const result = CNPJ.create('11111111111111');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('CNPJ cannot have all digits the same');
    });

    it('should fail with invalid check digits', () => {
      const result = CNPJ.create('11222333000199'); // wrong check digits

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('CNPJ has invalid check digits');
    });

    it('should fail with invalid check digits (formatted)', () => {
      const result = CNPJ.create('11.222.333/0001-99'); // wrong check digits

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('CNPJ has invalid check digits');
    });

    it('should fail with letters in CNPJ', () => {
      const result = CNPJ.create('11ABC33300018A');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('CNPJ must have exactly 14 digits');
    });
  });

  describe('getDigitsOnly', () => {
    it('should return only digits from formatted CNPJ', () => {
      const cnpj = CNPJ.create('11.222.333/0001-81').getValue();

      expect(cnpj.getDigitsOnly()).toBe('11222333000181');
    });
  });

  describe('getFormatted', () => {
    it('should return formatted CNPJ', () => {
      const cnpj = CNPJ.create('11222333000181').getValue();

      expect(cnpj.getFormatted()).toBe('11.222.333/0001-81');
    });

    it('should equal value property', () => {
      const cnpj = CNPJ.create('11222333000181').getValue();

      expect(cnpj.getFormatted()).toBe(cnpj.value);
    });
  });

  describe('Valid real-world CNPJs', () => {
    const validCNPJs = [
      '11222333000181',
      '34028316000103',
      '00000000000191', // Valid edge case
      '11444777000161',
    ];

    validCNPJs.forEach((cnpj) => {
      it(`should accept valid CNPJ: ${cnpj}`, () => {
        const result = CNPJ.create(cnpj);

        expect(result.isSuccess).toBe(true);
      });
    });
  });

  describe('Invalid CNPJs', () => {
    const invalidCNPJs = [
      '11222333000180', // wrong last digit
      '11222333000191', // wrong last digit
      '00000000000000', // all zeros
      '11111111111111', // all same
      '12345678901234', // invalid check digits
    ];

    invalidCNPJs.forEach((cnpj) => {
      it(`should reject invalid CNPJ: ${cnpj}`, () => {
        const result = CNPJ.create(cnpj);

        expect(result.isFailure).toBe(true);
      });
    });
  });
});
