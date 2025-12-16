import { describe, it, expect } from '@jest/globals';
import { Category } from './category';

describe('Category Value Object', () => {
  describe('create', () => {
    it('deve criar Category válida', () => {
      const categoryOrError = Category.create('Alimentação');

      expect(categoryOrError.isSuccess).toBe(true);
      expect(categoryOrError.getValue().value).toBe('Alimentação');
    });

    it('deve normalizar primeira letra maiúscula', () => {
      const categoryOrError = Category.create('alimentação');

      expect(categoryOrError.isSuccess).toBe(true);
      expect(categoryOrError.getValue().value).toBe('Alimentação');
    });

    it('deve normalizar TODAS MAIÚSCULAS para Primeira Maiúscula', () => {
      const categoryOrError = Category.create('ALIMENTAÇÃO');

      expect(categoryOrError.isSuccess).toBe(true);
      expect(categoryOrError.getValue().value).toBe('Alimentação');
    });

    it('deve normalizar múltiplas palavras', () => {
      const categoryOrError = Category.create('despesas com pessoal');

      expect(categoryOrError.isSuccess).toBe(true);
      expect(categoryOrError.getValue().value).toBe('Despesas Com Pessoal');
    });

    it('deve remover espaços em branco extras', () => {
      const categoryOrError = Category.create('  Alimentação  ');

      expect(categoryOrError.isSuccess).toBe(true);
      expect(categoryOrError.getValue().value).toBe('Alimentação');
    });

    it('deve falhar com string vazia', () => {
      const categoryOrError = Category.create('');

      expect(categoryOrError.isFailure).toBe(true);
      expect(categoryOrError.error).toContain('vazia');
    });

    it('deve falhar com apenas espaços', () => {
      const categoryOrError = Category.create('   ');

      expect(categoryOrError.isFailure).toBe(true);
      expect(categoryOrError.error).toContain('vazia');
    });

    it('deve falhar com categoria muito longa (>100 caracteres)', () => {
      const longCategory = 'a'.repeat(101);
      const categoryOrError = Category.create(longCategory);

      expect(categoryOrError.isFailure).toBe(true);
      expect(categoryOrError.error).toContain('longa');
    });

    it('deve aceitar categoria com exatamente 100 caracteres', () => {
      const exactCategory = 'a'.repeat(100);
      const categoryOrError = Category.create(exactCategory);

      expect(categoryOrError.isSuccess).toBe(true);
    });
  });

  describe('equals', () => {
    it('deve considerar iguais categorias com mesmo valor', () => {
      const category1 = Category.create('Alimentação').getValue();
      const category2 = Category.create('Alimentação').getValue();

      expect(category1.equals(category2)).toBe(true);
    });

    it('deve considerar iguais categorias normalizadas igualmente', () => {
      const category1 = Category.create('alimentação').getValue();
      const category2 = Category.create('ALIMENTAÇÃO').getValue();

      expect(category1.equals(category2)).toBe(true);
    });

    it('deve considerar diferentes categorias com valores diferentes', () => {
      const category1 = Category.create('Alimentação').getValue();
      const category2 = Category.create('Transporte').getValue();

      expect(category1.equals(category2)).toBe(false);
    });
  });
});
