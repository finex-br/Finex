import { describe, it, expect } from '@jest/globals';
import { FinancialTransaction } from './financial-transaction';
import { Money } from '../value-objects/money';
import { TransactionType } from '../value-objects/transaction-type';
import { Category } from '../value-objects/category';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';

describe('FinancialTransaction Entity', () => {
  // Helper para criar Value Objects válidos
  const createValidValueObjects = () => {
    const moneyResult = Money.create(1000.50, 'BRL');
    const typeResult = TransactionType.create('RECEITA');
    const categoryResult = Category.create('Vendas');

    return {
      amount: moneyResult.getValue(),
      type: typeResult.getValue(),
      category: categoryResult.getValue(),
    };
  };

  describe('create', () => {
    it('deve criar uma FinancialTransaction válida com propriedades obrigatórias', () => {
      const { amount, type, category } = createValidValueObjects();
      const date = new Date('2024-01-15');

      const result = FinancialTransaction.create({
        companyId: 'company-123',
        date,
        description: 'Venda de produto',
        amount,
        type,
        category,
      });

      expect(result.isSuccess).toBe(true);
      
      const transaction = result.getValue();
      expect(transaction.companyId).toBe('company-123');
      expect(transaction.date).toEqual(date);
      expect(transaction.description).toBe('Venda de produto');
      expect(transaction.amount).toEqual(amount);
      expect(transaction.type).toEqual(type);
      expect(transaction.category).toEqual(category);
      expect(transaction.createdAt).toBeInstanceOf(Date);
      expect(transaction.updatedAt).toBeInstanceOf(Date);
      expect(transaction.competenceDate).toBeUndefined();
      expect(transaction.paymentDate).toBeUndefined();
    });

    it('deve criar uma FinancialTransaction com datas opcionais (competenceDate e paymentDate)', () => {
      const { amount, type, category } = createValidValueObjects();
      const date = new Date('2024-01-15');
      const competenceDate = new Date('2024-02-01');
      const paymentDate = new Date('2024-01-20');

      const result = FinancialTransaction.create({
        companyId: 'company-123',
        date,
        description: 'Venda a prazo',
        amount,
        type,
        category,
        competenceDate,
        paymentDate,
      });

      expect(result.isSuccess).toBe(true);
      
      const transaction = result.getValue();
      expect(transaction.competenceDate).toEqual(competenceDate);
      expect(transaction.paymentDate).toEqual(paymentDate);
    });

    it('deve criar uma FinancialTransaction com ID customizado', () => {
      const { amount, type, category } = createValidValueObjects();
      const customId = new UniqueEntityID('custom-id-123');

      const result = FinancialTransaction.create(
        {
          companyId: 'company-123',
          date: new Date(),
          description: 'Transação com ID',
          amount,
          type,
          category,
        },
        customId,
      );

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id.toString()).toBe('custom-id-123');
    });

    it('deve falhar se companyId for vazio', () => {
      const { amount, type, category } = createValidValueObjects();

      const result = FinancialTransaction.create({
        companyId: '',
        date: new Date(),
        description: 'Teste',
        amount,
        type,
        category,
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('CompanyId é obrigatório');
    });

    it('deve falhar se companyId for apenas espaços', () => {
      const { amount, type, category } = createValidValueObjects();

      const result = FinancialTransaction.create({
        companyId: '   ',
        date: new Date(),
        description: 'Teste',
        amount,
        type,
        category,
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('CompanyId é obrigatório');
    });

    it('deve falhar se description for vazia', () => {
      const { amount, type, category } = createValidValueObjects();

      const result = FinancialTransaction.create({
        companyId: 'company-123',
        date: new Date(),
        description: '',
        amount,
        type,
        category,
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Descrição é obrigatória');
    });

    it('deve falhar se description for apenas espaços', () => {
      const { amount, type, category } = createValidValueObjects();

      const result = FinancialTransaction.create({
        companyId: 'company-123',
        date: new Date(),
        description: '   ',
        amount,
        type,
        category,
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Descrição é obrigatória');
    });

    it('deve falhar se description tiver mais de 500 caracteres', () => {
      const { amount, type, category } = createValidValueObjects();
      const longDescription = 'a'.repeat(501);

      const result = FinancialTransaction.create({
        companyId: 'company-123',
        date: new Date(),
        description: longDescription,
        amount,
        type,
        category,
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Descrição muito longa (máximo 500 caracteres)');
    });

    it('deve aceitar description com exatamente 500 caracteres', () => {
      const { amount, type, category } = createValidValueObjects();
      const maxDescription = 'a'.repeat(500);

      const result = FinancialTransaction.create({
        companyId: 'company-123',
        date: new Date(),
        description: maxDescription,
        amount,
        type,
        category,
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().description).toBe(maxDescription);
    });
  });

  describe('getCompetenceMonth', () => {
    it('deve retornar o mês/ano da competenceDate se estiver definida', () => {
      const { amount, type, category } = createValidValueObjects();
      const date = new Date('2024-01-15');
      const competenceDate = new Date('2024-03-20'); // Março 2024

      const result = FinancialTransaction.create({
        companyId: 'company-123',
        date,
        description: 'Teste',
        amount,
        type,
        category,
        competenceDate,
      });

      const transaction = result.getValue();
      expect(transaction.getCompetenceMonth()).toBe('Mar/2024');
    });

    it('deve retornar o mês/ano da date se competenceDate for undefined', () => {
      const { amount, type, category } = createValidValueObjects();
      const date = new Date('2024-07-10'); // Julho 2024

      const result = FinancialTransaction.create({
        companyId: 'company-123',
        date,
        description: 'Teste',
        amount,
        type,
        category,
      });

      const transaction = result.getValue();
      expect(transaction.getCompetenceMonth()).toBe('Jul/2024');
    });

    it('deve retornar mês em português abreviado', () => {
      const { amount, type, category } = createValidValueObjects();
      
      // Usar construtores explícitos para evitar problemas de timezone
      const months = [
        { date: new Date(2024, 0, 15), expected: 'Jan/2024' },  // Janeiro = 0
        { date: new Date(2024, 1, 15), expected: 'Fev/2024' },  // Fevereiro = 1
        { date: new Date(2024, 2, 15), expected: 'Mar/2024' },  // Março = 2
        { date: new Date(2024, 3, 15), expected: 'Abr/2024' },  // Abril = 3
        { date: new Date(2024, 4, 15), expected: 'Mai/2024' },  // Maio = 4
        { date: new Date(2024, 5, 15), expected: 'Jun/2024' },  // Junho = 5
        { date: new Date(2024, 6, 15), expected: 'Jul/2024' },  // Julho = 6
        { date: new Date(2024, 7, 15), expected: 'Ago/2024' },  // Agosto = 7
        { date: new Date(2024, 8, 15), expected: 'Set/2024' },  // Setembro = 8
        { date: new Date(2024, 9, 15), expected: 'Out/2024' },  // Outubro = 9
        { date: new Date(2024, 10, 15), expected: 'Nov/2024' }, // Novembro = 10
        { date: new Date(2024, 11, 15), expected: 'Dez/2024' }, // Dezembro = 11
      ];

      months.forEach(({ date, expected }) => {
        const result = FinancialTransaction.create({
          companyId: 'company-123',
          date,
          description: 'Teste',
          amount,
          type,
          category,
        });

        const transaction = result.getValue();
        expect(transaction.getCompetenceMonth()).toBe(expected);
      });
    });
  });

  describe('getters', () => {
    it('todos os getters devem retornar os valores corretos', () => {
      const { amount, type, category } = createValidValueObjects();
      const date = new Date('2024-01-15');
      const competenceDate = new Date('2024-02-01');
      const paymentDate = new Date('2024-01-20');

      const result = FinancialTransaction.create({
        companyId: 'company-xyz',
        date,
        description: 'Transação completa',
        amount,
        type,
        category,
        competenceDate,
        paymentDate,
      });

      const transaction = result.getValue();

      // Verifica todos os getters
      expect(transaction.companyId).toBe('company-xyz');
      expect(transaction.date).toEqual(date);
      expect(transaction.description).toBe('Transação completa');
      expect(transaction.amount).toEqual(amount);
      expect(transaction.type).toEqual(type);
      expect(transaction.category).toEqual(category);
      expect(transaction.competenceDate).toEqual(competenceDate);
      expect(transaction.paymentDate).toEqual(paymentDate);
      expect(transaction.createdAt).toBeInstanceOf(Date);
      expect(transaction.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('timestamps', () => {
    it('createdAt e updatedAt devem ser definidos automaticamente no momento da criação', () => {
      const { amount, type, category } = createValidValueObjects();
      const before = new Date();

      const result = FinancialTransaction.create({
        companyId: 'company-123',
        date: new Date(),
        description: 'Teste',
        amount,
        type,
        category,
      });

      const after = new Date();
      const transaction = result.getValue();

      expect(transaction.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(transaction.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(transaction.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(transaction.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('createdAt e updatedAt devem ter o mesmo valor na criação', () => {
      const { amount, type, category } = createValidValueObjects();

      const result = FinancialTransaction.create({
        companyId: 'company-123',
        date: new Date(),
        description: 'Teste',
        amount,
        type,
        category,
      });

      const transaction = result.getValue();
      expect(transaction.createdAt.getTime()).toBe(transaction.updatedAt.getTime());
    });
  });
});
