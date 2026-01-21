import { describe, it, expect } from '@jest/globals';
import { Email } from '../../../modules/authentication/domain/value-objects/email';
import {
  generateRandomString,
  generateRandomUnicodeString,
  generateEdgeCases,
  mutateString,
  generateBoundaryValues,
  generateInvalidEmails,
  runFuzzingTest,
  runStatisticalFuzzing,
} from './fuzzing-utils';

/**
 * Exemplo de uso das Fuzzing Utilities
 * 
 * Este arquivo demonstra como usar as funções utilitárias
 * para criar testes de fuzzing eficientes e reutilizáveis.
 */

describe('Fuzzing Utils - Usage Examples', () => {
  describe('Example 1: Basic Random Fuzzing', () => {
    it('should test Email with 100 random strings', () => {
      runFuzzingTest(
        100,
        (input) => {
          const result = Email.create(input);
          expect(result).toBeDefined();
          expect(typeof result.isSuccess).toBe('boolean');
        },
        () => generateRandomString(Math.floor(Math.random() * 100) + 1)
      );
    });
  });

  describe('Example 2: Unicode Fuzzing', () => {
    it('should handle unicode strings', () => {
      for (let i = 0; i < 50; i++) {
        const unicode = generateRandomUnicodeString(20);
        
        expect(() => {
          const result = Email.create(unicode);
          expect(result).toBeDefined();
        }).not.toThrow();
      }
    });
  });

  describe('Example 3: Edge Cases Testing', () => {
    it('should handle all edge cases', () => {
      const edgeCases = generateEdgeCases();
      
      edgeCases.forEach((testCase) => {
        expect(() => {
          const result = Email.create(testCase as any);
          expect(result).toBeDefined();
          // Se não for string, null ou undefined, deve falhar com erro de tipo
          if (typeof testCase !== 'string' && testCase !== null && testCase !== undefined) {
            expect(result.isFailure).toBe(true);
            expect(result.error).toContain('must be a string');
          }
        }).not.toThrow();
      });
    });
  });

  describe('Example 4: Mutation Testing', () => {
    it('should test mutations of valid email', () => {
      const validEmail = 'user@example.com';
      const mutations = mutateString(validEmail);
      
      mutations.forEach((mutation) => {
        expect(() => {
          const result = Email.create(mutation);
          expect(result).toBeDefined();
        }).not.toThrow();
      });
    });
  });

  describe('Example 5: Boundary Value Testing', () => {
    it('should test string length boundaries', () => {
      const boundaries = generateBoundaryValues('string');
      
      boundaries.forEach((boundary) => {
        expect(() => {
          const result = Email.create(boundary);
          expect(result).toBeDefined();
        }).not.toThrow();
      });
    });
  });

  describe('Example 6: Known Invalid Inputs', () => {
    it('should demonstrate invalid email detection', () => {
      // Nota: Este é apenas um exemplo. A regex simples do Email.ts
      // não valida todas as regras RFC 5322. Para testes completos,
      // veja value-objects-fuzzing.spec.ts
      const obviouslyInvalidEmails = [
        '',
        'invalid',
        'no-at-sign',
        '@no-local',
        'no-domain@',
      ];
      
      obviouslyInvalidEmails.forEach((email) => {
        const result = Email.create(email);
        expect(result.isFailure).toBe(true);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('Example 7: Statistical Fuzzing', () => {
    it('should have consistent failure rate for random emails', () => {
      const stats = runStatisticalFuzzing(
        100,
        (input) => Email.create(input).isSuccess,
        () => generateRandomString(Math.floor(Math.random() * 50) + 1)
      );

      console.log('Email Fuzzing Statistics:');
      console.log(`  Success: ${stats.successCount} (${stats.successRate.toFixed(2)}%)`);
      console.log(`  Failure: ${stats.failureCount} (${stats.failureRate.toFixed(2)}%)`);

      // A maioria deve falhar (strings aleatórias raramente são emails válidos)
      expect(stats.failureRate).toBeGreaterThan(80);
    });
  });

  describe('Example 8: Combined Fuzzing Strategies', () => {
    it('should use multiple fuzzing strategies together', () => {
      // Strategy 1: Random strings
      runFuzzingTest(
        20,
        (input) => expect(() => Email.create(input)).not.toThrow(),
        () => generateRandomString(30)
      );

      // Strategy 2: Unicode
      runFuzzingTest(
        20,
        (input) => expect(() => Email.create(input)).not.toThrow(),
        () => generateRandomUnicodeString(15)
      );

      // Strategy 3: Edge cases
      const edgeCases = generateEdgeCases();
      edgeCases.forEach((edge) => {
        expect(() => {
          Email.create(edge as any);
        }).not.toThrow();
      });

      // Strategy 4: Mutations
      const validEmail = 'test@example.com';
      const mutations = mutateString(validEmail);
      mutations.forEach((mutation) => {
        expect(() => Email.create(mutation)).not.toThrow();
      });
    });
  });
});
