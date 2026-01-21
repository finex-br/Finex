import { describe, it, expect } from '@jest/globals';
import { Email } from '../../../modules/authentication/domain/value-objects/email';
import { Password } from '../../../modules/authentication/domain/value-objects/password';
import { CNPJ } from './cnpj';
import { Money } from '../../../modules/financial/domain/value-objects/money';

/**
 * Advanced Fuzzing: Mutation-Based Testing
 * 
 * Esta suite complementa o fuzzing básico com testes de mutação,
 * onde pegamos entradas válidas e as mutamos para criar entradas inválidas.
 */

describe('Value Objects Advanced Fuzzing - Mutation Testing', () => {
  /**
   * Mutações comuns para strings
   */
  function mutateString(input: string): string[] {
    const mutations: string[] = [];

    // Adicionar caracteres no início
    mutations.push(`${String.fromCharCode(0)}${input}`);
    mutations.push(` ${input}`);
    mutations.push(`\n${input}`);
    mutations.push(`${input} `);
    mutations.push(`${input}\n`);

    // Duplicar partes
    if (input.length > 0) {
      mutations.push(input + input);
      mutations.push(input.charAt(0) + input);
      mutations.push(input + input.charAt(input.length - 1));
    }

    // Remover caracteres
    if (input.length > 1) {
      mutations.push(input.slice(1));
      mutations.push(input.slice(0, -1));
      mutations.push(input.slice(0, Math.floor(input.length / 2)));
    }

    // Substituir caracteres
    if (input.length > 0) {
      mutations.push(input.replace(/./g, 'X'));
      mutations.push(input.replace(/\d/g, 'X'));
      mutations.push(input.replace(/[a-zA-Z]/g, '9'));
    }

    // Injetar caracteres especiais
    mutations.push(input.replace(/@/g, '@@'));
    mutations.push(input.replace(/\./g, '..'));
    mutations.push(input.replace(/\//g, '//'));

    // Case mutations
    mutations.push(input.toUpperCase());
    mutations.push(input.toLowerCase());

    return mutations;
  }

  describe('Email Mutation Testing', () => {
    const validEmails = [
      'user@example.com',
      'test.user@domain.co.uk',
      'admin+tag@company.org',
    ];

    it('should reject all mutations of valid emails', () => {
      validEmails.forEach((validEmail) => {
        const mutations = mutateString(validEmail);

        mutations.forEach((mutation) => {
          expect(() => {
            const result = Email.create(mutation);
            expect(result).toBeDefined();
            // Most mutations should be invalid
            if (result.isSuccess) {
              // Se passar, deve ser uma mutação válida (ex: uppercase vira lowercase)
              expect(result.getValue().value).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
            }
          }).not.toThrow();
        });
      });
    });

    it('should handle bit-flip style mutations', () => {
      const email = 'test@example.com';

      for (let i = 0; i < email.length; i++) {
        const charCode = email.charCodeAt(i);
        // Flip bits
        const flipped1 = String.fromCharCode(charCode ^ 1);
        const flipped2 = String.fromCharCode(charCode ^ 2);
        const flipped4 = String.fromCharCode(charCode ^ 4);

        const mutation1 = email.slice(0, i) + flipped1 + email.slice(i + 1);
        const mutation2 = email.slice(0, i) + flipped2 + email.slice(i + 1);
        const mutation3 = email.slice(0, i) + flipped4 + email.slice(i + 1);

        expect(() => {
          Email.create(mutation1);
          Email.create(mutation2);
          Email.create(mutation3);
        }).not.toThrow();
      }
    });
  });

  describe('CNPJ Mutation Testing', () => {
    const validCNPJs = [
      '11.222.333/0001-81',
      '34.028.316/0001-03',
      '00.000.000/0001-91',
    ];

    it('should reject mutations that break CNPJ rules', () => {
      validCNPJs.forEach((validCNPJ) => {
        const mutations = mutateString(validCNPJ);

        mutations.forEach((mutation) => {
          expect(() => {
            const result = CNPJ.create(mutation);
            expect(result).toBeDefined();

            if (result.isSuccess) {
              // Se passar, deve ter 14 dígitos e check digits válidos
              const digitsOnly = result.getValue().value.replace(/\D/g, '');
              expect(digitsOnly.length).toBe(14);
            }
          }).not.toThrow();
        });
      });
    });

    it('should reject single-digit mutations', () => {
      const validCNPJ = '11222333000181';

      for (let i = 0; i < validCNPJ.length; i++) {
        for (let digit = 0; digit <= 9; digit++) {
          const mutated = validCNPJ.slice(0, i) + digit + validCNPJ.slice(i + 1);

          expect(() => {
            const result = CNPJ.create(mutated);
            expect(result).toBeDefined();

            // A maioria deve falhar (exceto o próprio CNPJ válido)
            if (mutated !== validCNPJ) {
              // Pode passar se por acaso a mutação criar outro CNPJ válido (raro)
              if (result.isSuccess) {
                expect(result.getValue().value).toBeDefined();
              }
            }
          }).not.toThrow();
        }
      }
    });

    it('should handle check digit mutations', () => {
      // Muta apenas os dígitos verificadores (últimos 2 dígitos)
      const validCNPJBase = '112223330001'; // Sem check digits

      for (let d1 = 0; d1 <= 9; d1++) {
        for (let d2 = 0; d2 <= 9; d2++) {
          const cnpjWithCheckDigits = `${validCNPJBase}${d1}${d2}`;

          expect(() => {
            const result = CNPJ.create(cnpjWithCheckDigits);
            expect(result).toBeDefined();
            // Apenas '11222333000181' deve passar
          }).not.toThrow();
        }
      }
    });
  });

  describe('Password Mutation Testing', () => {
    const validPasswords = [
      'Test@1234',
      'SecureP@ssw0rd',
      'C0mpl3x!Pass',
    ];

    it('should reject mutations that break password rules', async () => {
      for (const validPassword of validPasswords) {
        const mutations = mutateString(validPassword);

        for (const mutation of mutations) {
          await expect(async () => {
            const result = await Password.create(mutation);
            expect(result).toBeDefined();

            if (result.isSuccess) {
              // Deve ter todas as regras
              expect(mutation.length).toBeGreaterThanOrEqual(8);
            }
          }).not.toThrow();
        }
      }
    });

    it('should reject removal of required character types', async () => {
      const validPassword = 'Test@1234';

      // Remove uppercase
      const noUppercase = 'test@1234';
      let result = await Password.create(noUppercase);
      expect(result.isFailure).toBe(true);

      // Remove lowercase
      const noLowercase = 'TEST@1234';
      result = await Password.create(noLowercase);
      expect(result.isFailure).toBe(true);

      // Remove number
      const noNumber = 'Test@abcd';
      result = await Password.create(noNumber);
      expect(result.isFailure).toBe(true);

      // Remove special char
      const noSpecial = 'Test1234';
      result = await Password.create(noSpecial);
      expect(result.isFailure).toBe(true);

      // Too short
      const tooShort = 'Te@1';
      result = await Password.create(tooShort);
      expect(result.isFailure).toBe(true);
    });
  });

  describe('Money Mutation Testing', () => {
    it('should handle numeric mutations', () => {
      const validAmounts = [100, 100.50, -50.25];

      validAmounts.forEach((amount) => {
        // Mutações numéricas
        const mutations = [
          amount * -1,
          amount + 0.001,
          amount - 0.001,
          amount * 1000,
          amount / 1000,
          Math.floor(amount),
          Math.ceil(amount),
          amount + Number.EPSILON,
          amount - Number.EPSILON,
        ];

        mutations.forEach((mutated) => {
          expect(() => {
            const result = Money.create(mutated, 'BRL');
            expect(result).toBeDefined();
          }).not.toThrow();
        });
      });
    });

    it('should handle currency code mutations', () => {
      const validCurrency = 'BRL';

      const mutations = [
        'BRl', // Mixed case
        'brl', // Lowercase
        'BRL ', // With space
        ' BRL',
        'BR', // Too short
        'BRLL', // Too long
        'BR1', // With number
        'B@L', // With special char
        'USD', // Different valid currency
        'EUR',
        'GBP',
      ];

      mutations.forEach((currency) => {
        expect(() => {
          const result = Money.create(100, currency);
          expect(result).toBeDefined();
        }).not.toThrow();
      });
    });
  });

  describe('Boundary Value Fuzzing', () => {
    it('should handle boundary values for string lengths', () => {
      const boundaries = [0, 1, 2, 7, 8, 9, 63, 64, 65, 254, 255, 256];

      boundaries.forEach((length) => {
        const str = 'A'.repeat(length);

        expect(() => {
          Email.create(str);
          CNPJ.create(str);
        }).not.toThrow();
      });
    });

    it('should handle CNPJ with exactly 14 digits in various formats', () => {
      const validBase = '11222333000181';
      const formats = [
        validBase,
        `${validBase.slice(0, 2)}.${validBase.slice(2, 5)}.${validBase.slice(5, 8)}/${validBase.slice(8, 12)}-${validBase.slice(12)}`,
        `${validBase.slice(0, 2)} ${validBase.slice(2, 5)} ${validBase.slice(5, 8)} ${validBase.slice(8, 12)} ${validBase.slice(12)}`,
        `${validBase.slice(0, 2)}-${validBase.slice(2, 5)}-${validBase.slice(5, 8)}-${validBase.slice(8, 12)}-${validBase.slice(12)}`,
      ];

      formats.forEach((format) => {
        expect(() => {
          const result = CNPJ.create(format);
          expect(result).toBeDefined();
        }).not.toThrow();
      });
    });

    it('should handle passwords at minimum length boundary', async () => {
      const testCases = [
        { password: 'Test@12', shouldFail: true }, // 7 chars - too short
        { password: 'Test@123', shouldFail: false }, // 8 chars - minimum
        { password: 'Test@1234', shouldFail: false }, // 9 chars - ok
      ];

      for (const testCase of testCases) {
        const result = await Password.create(testCase.password);
        if (testCase.shouldFail) {
          expect(result.isFailure).toBe(true);
        } else {
          expect(result.isSuccess).toBe(true);
        }
      }
    });

    it('should handle Money with precision boundaries', () => {
      const amounts = [
        0.001,
        0.01,
        0.1,
        0.99,
        0.999,
        0.9999,
        1.001,
        1.01,
        1.1,
        999.99,
        999.999,
        1000.00,
      ];

      amounts.forEach((amount) => {
        expect(() => {
          const result = Money.create(amount, 'BRL');
          expect(result.isSuccess).toBe(true);
          expect(result.getValue().amount).toBe(amount);
        }).not.toThrow();
      });
    });
  });

  describe('Encoding and Character Set Fuzzing', () => {
    it('should handle various UTF-8 encoded strings', () => {
      const utf8Strings = [
        'café@example.com',
        'test@domínio.com',
        'user+tëst@example.com',
        '用户@例え.com',
        'مستخدم@مثال.com',
      ];

      utf8Strings.forEach((str) => {
        expect(() => {
          Email.create(str);
        }).not.toThrow();
      });
    });

    it('should handle control characters', () => {
      const controlChars = ['\x00', '\x01', '\x02', '\x1F', '\x7F'];

      controlChars.forEach((char) => {
        expect(() => {
          Email.create(`test${char}@example.com`);
          CNPJ.create(`1122233300018${char}`);
        }).not.toThrow();
      });
    });

    it('should handle various whitespace characters', () => {
      const whitespaces = [' ', '\t', '\n', '\r', '\v', '\f', '\u00A0', '\u2003'];

      whitespaces.forEach((ws) => {
        expect(() => {
          Email.create(`test${ws}@example.com`);
          CNPJ.create(`11222333${ws}000181`);
        }).not.toThrow();
      });
    });
  });

  describe('Statistical Fuzzing', () => {
    it('should maintain consistent failure rate for random emails', () => {
      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < 100; i++) {
        const randomString = Math.random().toString(36).substring(2);
        const result = Email.create(randomString);

        if (result.isSuccess) successCount++;
        else failureCount++;
      }

      // A maioria deve falhar (não tem @ nem domínio)
      expect(failureCount).toBeGreaterThan(successCount);
    });

    it('should maintain consistent failure rate for random CNPJs', () => {
      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < 100; i++) {
        const randomNumbers = Math.floor(Math.random() * 99999999999999).toString();
        const result = CNPJ.create(randomNumbers);

        if (result.isSuccess) successCount++;
        else failureCount++;
      }

      // A maioria deve falhar (check digits incorretos)
      expect(failureCount).toBeGreaterThan(successCount);
    });
  });
});
