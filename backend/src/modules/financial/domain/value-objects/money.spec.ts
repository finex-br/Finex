import { describe, it, expect } from '@jest/globals';
import { Money } from './money';

describe('Money Value Object', () => {
  describe('create', () => {
    it('deve criar Money válido com valor positivo', () => {
      const moneyOrError = Money.create(100.50, 'BRL');

      expect(moneyOrError.isSuccess).toBe(true);
      expect(moneyOrError.getValue().amount).toBe(100.50);
      expect(moneyOrError.getValue().currency).toBe('BRL');
    });

    it('deve criar Money válido com valor zero', () => {
      const moneyOrError = Money.create(0, 'BRL');

      expect(moneyOrError.isSuccess).toBe(true);
      expect(moneyOrError.getValue().amount).toBe(0);
    });

    it('deve criar Money válido com valor negativo (para despesas)', () => {
      const moneyOrError = Money.create(-50.25, 'BRL');

      expect(moneyOrError.isSuccess).toBe(true);
      expect(moneyOrError.getValue().amount).toBe(-50.25);
    });

    it('deve normalizar currency para uppercase', () => {
      const moneyOrError = Money.create(100, 'usd');

      expect(moneyOrError.isSuccess).toBe(true);
      expect(moneyOrError.getValue().currency).toBe('USD');
    });

    it('deve usar BRL como currency padrão', () => {
      const moneyOrError = Money.create(100);

      expect(moneyOrError.isSuccess).toBe(true);
      expect(moneyOrError.getValue().currency).toBe('BRL');
    });

    it('deve falhar com valor NaN', () => {
      const moneyOrError = Money.create(NaN, 'BRL');

      expect(moneyOrError.isFailure).toBe(true);
      expect(moneyOrError.error).toBe('Valor inválido');
    });

    it('deve falhar com currency inválida (não tem 3 caracteres)', () => {
      const moneyOrError = Money.create(100, 'BR');

      expect(moneyOrError.isFailure).toBe(true);
      expect(moneyOrError.error).toBe('Código de moeda inválido (deve ter 3 caracteres)');
    });

    it('deve falhar com currency vazia', () => {
      const moneyOrError = Money.create(100, '');

      expect(moneyOrError.isFailure).toBe(true);
      expect(moneyOrError.error).toContain('inválido');
    });
  });

  describe('format', () => {
    it('deve formatar valor em BRL corretamente', () => {
      const money = Money.create(1234.56, 'BRL').getValue();

      const formatted = money.format();
      expect(formatted).toContain('1.234,56');
      expect(formatted).toContain('R$');
    });

    it('deve formatar valor zero', () => {
      const money = Money.create(0, 'BRL').getValue();

      const formatted = money.format();
      expect(formatted).toContain('0,00');
      expect(formatted).toContain('R$');
    });

    it('deve formatar valor negativo', () => {
      const money = Money.create(-500.75, 'BRL').getValue();

      expect(money.format()).toContain('-');
      expect(money.format()).toContain('500,75');
    });
  });

  describe('add', () => {
    it('deve somar dois valores da mesma moeda', () => {
      const money1 = Money.create(100, 'BRL').getValue();
      const money2 = Money.create(50, 'BRL').getValue();

      const resultOrError = money1.add(money2);

      expect(resultOrError.isSuccess).toBe(true);
      expect(resultOrError.getValue().amount).toBe(150);
    });

    it('deve falhar ao somar valores de moedas diferentes', () => {
      const money1 = Money.create(100, 'BRL').getValue();
      const money2 = Money.create(50, 'USD').getValue();

      const resultOrError = money1.add(money2);

      expect(resultOrError.isFailure).toBe(true);
      expect(resultOrError.error).toContain('moedas diferentes');
    });
  });

  describe('subtract', () => {
    it('deve subtrair dois valores da mesma moeda', () => {
      const money1 = Money.create(100, 'BRL').getValue();
      const money2 = Money.create(30, 'BRL').getValue();

      const resultOrError = money1.subtract(money2);

      expect(resultOrError.isSuccess).toBe(true);
      expect(resultOrError.getValue().amount).toBe(70);
    });

    it('deve falhar ao subtrair valores de moedas diferentes', () => {
      const money1 = Money.create(100, 'BRL').getValue();
      const money2 = Money.create(50, 'USD').getValue();

      const resultOrError = money1.subtract(money2);

      expect(resultOrError.isFailure).toBe(true);
      expect(resultOrError.error).toContain('moedas diferentes');
    });
  });

  describe('equals', () => {
    it('deve considerar iguais Money com mesmo valor e moeda', () => {
      const money1 = Money.create(100, 'BRL').getValue();
      const money2 = Money.create(100, 'BRL').getValue();

      expect(money1.equals(money2)).toBe(true);
    });

    it('deve considerar diferentes Money com valores diferentes', () => {
      const money1 = Money.create(100, 'BRL').getValue();
      const money2 = Money.create(200, 'BRL').getValue();

      expect(money1.equals(money2)).toBe(false);
    });

    it('deve considerar diferentes Money com moedas diferentes', () => {
      const money1 = Money.create(100, 'BRL').getValue();
      const money2 = Money.create(100, 'USD').getValue();

      expect(money1.equals(money2)).toBe(false);
    });
  });
});
