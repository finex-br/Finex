import { TransactionType } from './transaction-type';

describe('TransactionType Value Object', () => {
  describe('create', () => {
    it('deve criar RECEITA com string "RECEITA"', () => {
      const typeOrError = TransactionType.create('RECEITA');

      expect(typeOrError.isSuccess).toBe(true);
      expect(typeOrError.getValue().value).toBe('RECEITA');
    });

    it('deve criar DESPESA com string "DESPESA"', () => {
      const typeOrError = TransactionType.create('DESPESA');

      expect(typeOrError.isSuccess).toBe(true);
      expect(typeOrError.getValue().value).toBe('DESPESA');
    });

    it('deve normalizar "receita" minúscula para RECEITA', () => {
      const typeOrError = TransactionType.create('receita');

      expect(typeOrError.isSuccess).toBe(true);
      expect(typeOrError.getValue().value).toBe('RECEITA');
    });

    it('deve normalizar "despesa" minúscula para DESPESA', () => {
      const typeOrError = TransactionType.create('despesa');

      expect(typeOrError.isSuccess).toBe(true);
      expect(typeOrError.getValue().value).toBe('DESPESA');
    });

    it('deve remover espaços em branco', () => {
      const typeOrError = TransactionType.create('  RECEITA  ');

      expect(typeOrError.isSuccess).toBe(true);
      expect(typeOrError.getValue().value).toBe('RECEITA');
    });

    it('deve falhar com valor inválido', () => {
      const typeOrError = TransactionType.create('INVALIDO');

      expect(typeOrError.isFailure).toBe(true);
      expect(typeOrError.error).toContain('inválido');
    });

    it('deve falhar com string vazia', () => {
      const typeOrError = TransactionType.create('');

      expect(typeOrError.isFailure).toBe(true);
      expect(typeOrError.error).toContain('inválido');
    });
  });

  describe('isRevenue', () => {
    it('deve retornar true para RECEITA', () => {
      const type = TransactionType.create('RECEITA').getValue();

      expect(type.isRevenue()).toBe(true);
    });

    it('deve retornar false para DESPESA', () => {
      const type = TransactionType.create('DESPESA').getValue();

      expect(type.isRevenue()).toBe(false);
    });
  });

  describe('isExpense', () => {
    it('deve retornar true para DESPESA', () => {
      const type = TransactionType.create('DESPESA').getValue();

      expect(type.isExpense()).toBe(true);
    });

    it('deve retornar false para RECEITA', () => {
      const type = TransactionType.create('RECEITA').getValue();

      expect(type.isExpense()).toBe(false);
    });
  });

  describe('constants', () => {
    it('deve ter constante RECEITA', () => {
      expect(TransactionType.RECEITA).toBeDefined();
      expect(TransactionType.RECEITA.value).toBe('RECEITA');
    });

    it('deve ter constante DESPESA', () => {
      expect(TransactionType.DESPESA).toBeDefined();
      expect(TransactionType.DESPESA.value).toBe('DESPESA');
    });

    it('constantes devem ser singleton (mesma referência)', () => {
      const receita1 = TransactionType.RECEITA;
      const receita2 = TransactionType.RECEITA;

      expect(receita1).toBe(receita2);
    });
  });

  describe('equals', () => {
    it('deve considerar iguais RECEITA criados de formas diferentes', () => {
      const type1 = TransactionType.create('RECEITA').getValue();
      const type2 = TransactionType.RECEITA;

      expect(type1.equals(type2)).toBe(true);
    });

    it('deve considerar diferentes RECEITA e DESPESA', () => {
      const type1 = TransactionType.RECEITA;
      const type2 = TransactionType.DESPESA;

      expect(type1.equals(type2)).toBe(false);
    });
  });
});
