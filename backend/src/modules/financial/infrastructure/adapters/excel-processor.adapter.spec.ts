import { describe, it, expect, beforeEach } from '@jest/globals';
import * as XLSX from 'xlsx';
import { ExcelProcessorAdapter } from './excel-processor.adapter';
import { FinancialTransaction } from '../../domain/entities/financial-transaction';

describe('ExcelProcessorAdapter', () => {
  let adapter: ExcelProcessorAdapter;

  beforeEach(() => {
    adapter = new ExcelProcessorAdapter();
  });

  // Helper para criar um buffer de Excel a partir de dados
  const createExcelBuffer = (data: any[]): Buffer => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  };

  describe('processExcelFile', () => {
    it('deve processar um arquivo Excel válido com múltiplas transações', async () => {
      const excelData = [
        {
          Data: '2024-01-15',
          Descrição: 'Venda de produto A',
          Categoria: 'Vendas',
          Valor: 1500.50,
          Tipo: 'RECEITA',
        },
        {
          Data: '2024-01-16',
          Descrição: 'Compra de material',
          Categoria: 'Despesas Operacionais',
          Valor: 350.75,
          Tipo: 'DESPESA',
        },
        {
          Data: '2024-01-17',
          Descrição: 'Serviço prestado',
          Categoria: 'Serviços',
          Valor: 2000.00,
          Tipo: 'RECEITA',
        },
      ];

      const buffer = createExcelBuffer(excelData);
      const companyId = 'company-123';

      const transactions = await adapter.processExcelFile(buffer, companyId);

      expect(transactions).toHaveLength(3);

      // Verificar primeira transação
      expect(transactions[0].description).toBe('Venda de produto A');
      expect(transactions[0].amount.amount).toBe(1500.50);
      expect(transactions[0].type.isRevenue()).toBe(true);
      expect(transactions[0].category.value).toBe('Vendas');
      expect(transactions[0].companyId).toBe('company-123');

      // Verificar segunda transação
      expect(transactions[1].description).toBe('Compra de material');
      expect(transactions[1].amount.amount).toBe(350.75);
      expect(transactions[1].type.isExpense()).toBe(true);
      expect(transactions[1].category.value).toBe('Despesas Operacionais');

      // Verificar terceira transação
      expect(transactions[2].description).toBe('Serviço prestado');
      expect(transactions[2].amount.amount).toBe(2000.00);
      expect(transactions[2].type.isRevenue()).toBe(true);
    });

    it('deve detectar tipo RECEITA por palavras-chave (receita, revenue)', async () => {
      const excelData = [
        { Data: '2024-01-15', Descrição: 'Teste 1', Categoria: 'Vendas', Valor: 100, Tipo: 'receita' },
        { Data: '2024-01-15', Descrição: 'Teste 2', Categoria: 'Vendas', Valor: 100, Tipo: 'RECEITA' },
        { Data: '2024-01-15', Descrição: 'Teste 3', Categoria: 'Vendas', Valor: 100, Tipo: 'Revenue' },
        { Data: '2024-01-15', Descrição: 'Teste 4', Categoria: 'Vendas', Valor: 100, Tipo: 'Receitas' },
      ];

      const buffer = createExcelBuffer(excelData);
      const transactions = await adapter.processExcelFile(buffer, 'company-123');

      expect(transactions).toHaveLength(4);
      transactions.forEach((transaction) => {
        expect(transaction.type.isRevenue()).toBe(true);
      });
    });

    it('deve detectar tipo DESPESA por palavras-chave (despesa, expense)', async () => {
      const excelData = [
        { Data: '2024-01-15', Descrição: 'Teste 1', Categoria: 'Compras', Valor: 100, Tipo: 'despesa' },
        { Data: '2024-01-15', Descrição: 'Teste 2', Categoria: 'Compras', Valor: 100, Tipo: 'DESPESA' },
        { Data: '2024-01-15', Descrição: 'Teste 3', Categoria: 'Compras', Valor: 100, Tipo: 'Expense' },
        { Data: '2024-01-15', Descrição: 'Teste 4', Categoria: 'Compras', Valor: 100, Tipo: 'Despesas' },
      ];

      const buffer = createExcelBuffer(excelData);
      const transactions = await adapter.processExcelFile(buffer, 'company-123');

      expect(transactions).toHaveLength(4);
      transactions.forEach((transaction) => {
        expect(transaction.type.isExpense()).toBe(true);
      });
    });

    it('deve detectar tipo pelo sinal do valor se Tipo não estiver presente', async () => {
      const excelData = [
        { Data: '2024-01-15', Descrição: 'Receita', Categoria: 'Vendas', Valor: 100 },   // Positivo = RECEITA
        { Data: '2024-01-15', Descrição: 'Despesa', Categoria: 'Compras', Valor: -50 },  // Negativo = DESPESA
        { Data: '2024-01-15', Descrição: 'Zero', Categoria: 'Outros', Valor: 0 },        // Zero = RECEITA
      ];

      const buffer = createExcelBuffer(excelData);
      const transactions = await adapter.processExcelFile(buffer, 'company-123');

      expect(transactions).toHaveLength(3);
      expect(transactions[0].type.isRevenue()).toBe(true);  // Positivo
      expect(transactions[1].type.isExpense()).toBe(true);  // Negativo
      expect(transactions[2].type.isRevenue()).toBe(true);  // Zero = RECEITA
    });

    it('deve usar valores absolutos para Money (valores negativos devem virar positivos)', async () => {
      const excelData = [
        { Data: '2024-01-15', Descrição: 'Despesa', Categoria: 'Compras', Valor: -500.75, Tipo: 'DESPESA' },
      ];

      const buffer = createExcelBuffer(excelData);
      const transactions = await adapter.processExcelFile(buffer, 'company-123');

      expect(transactions).toHaveLength(1);
      expect(transactions[0].amount.amount).toBe(500.75); // Valor absoluto
      expect(transactions[0].type.isExpense()).toBe(true);
    });

    it('deve aceitar nomes de colunas em diferentes cases (case-insensitive)', async () => {
      const excelData = [
        {
          data: '2024-01-15',
          descricao: 'Teste minúsculo',
          categoria: 'Vendas',
          valor: 100,
          tipo: 'receita',
        },
        {
          DATA: '2024-01-16',
          DESCRIPTION: 'Teste maiúsculo',
          CATEGORY: 'Compras',
          AMOUNT: 200,
          TYPE: 'DESPESA',
        },
        {
          date: '2024-01-17',
          description: 'Teste inglês',
          category: 'Serviços',
          value: 300,
          type: 'revenue',
        },
      ];

      const buffer = createExcelBuffer(excelData);
      const transactions = await adapter.processExcelFile(buffer, 'company-123');

      expect(transactions).toHaveLength(3);
      expect(transactions[0].description).toBe('Teste minúsculo');
      expect(transactions[1].description).toBe('Teste maiúsculo');
      expect(transactions[2].description).toBe('Teste inglês');
    });

    it('deve usar valores padrão quando descrição ou categoria estiverem ausentes', async () => {
      const excelData = [
        {
          Data: '2024-01-15',
          // Sem Descrição
          // Sem Categoria
          Valor: 100,
          Tipo: 'RECEITA',
        },
      ];

      const buffer = createExcelBuffer(excelData);
      const transactions = await adapter.processExcelFile(buffer, 'company-123');

      expect(transactions).toHaveLength(1);
      expect(transactions[0].description).toBe('Sem descrição');
      expect(transactions[0].category.value).toBe('Sem Categoria'); // Title Case
    });

    it('deve pular linhas com valores inválidos e continuar processando as válidas', async () => {
      const excelData = [
        { Data: '2024-01-15', Descrição: 'Válida 1', Categoria: 'Vendas', Valor: 100, Tipo: 'RECEITA' },
        { Data: '2024-01-16', Descrição: 'Inválida - Valor não numérico', Categoria: 'Vendas', Valor: 'abc', Tipo: 'RECEITA' },
        { Data: '2024-01-17', Descrição: 'Válida 2', Categoria: 'Compras', Valor: 200, Tipo: 'DESPESA' },
      ];

      const buffer = createExcelBuffer(excelData);
      const transactions = await adapter.processExcelFile(buffer, 'company-123');

      // Deve processar apenas as 2 válidas
      expect(transactions).toHaveLength(2);
      expect(transactions[0].description).toBe('Válida 1');
      expect(transactions[1].description).toBe('Válida 2');
    });

    it('deve parsear datas em formato string', async () => {
      const excelData = [
        { Data: '2024-01-15', Descrição: 'Teste', Categoria: 'Vendas', Valor: 100, Tipo: 'RECEITA' },
      ];

      const buffer = createExcelBuffer(excelData);
      const transactions = await adapter.processExcelFile(buffer, 'company-123');

      expect(transactions).toHaveLength(1);
      expect(transactions[0].date).toBeInstanceOf(Date);
      expect(transactions[0].date.getFullYear()).toBe(2024);
      expect(transactions[0].date.getMonth()).toBe(0); // Janeiro = 0
    });

    it('deve parsear datas em formato de número serial do Excel', async () => {
      // Excel armazena datas como número de dias desde 1900-01-01
      // Por exemplo: 44946 = 2023-01-15
      const excelData = [
        { Data: 45308, Descrição: 'Teste serial', Categoria: 'Vendas', Valor: 100, Tipo: 'RECEITA' },
      ];

      const buffer = createExcelBuffer(excelData);
      const transactions = await adapter.processExcelFile(buffer, 'company-123');

      expect(transactions).toHaveLength(1);
      expect(transactions[0].date).toBeInstanceOf(Date);
      // Serial 45308 = 2024-01-15
      expect(transactions[0].date.getFullYear()).toBe(2024);
    });

    it('deve parsear datas quando já são objetos Date', async () => {
      const dateObject = new Date('2024-02-20');
      const excelData = [
        { Data: dateObject, Descrição: 'Teste Date', Categoria: 'Vendas', Valor: 100, Tipo: 'RECEITA' },
      ];

      const buffer = createExcelBuffer(excelData);
      const transactions = await adapter.processExcelFile(buffer, 'company-123');

      expect(transactions).toHaveLength(1);
      expect(transactions[0].date).toBeInstanceOf(Date);
      expect(transactions[0].date.getFullYear()).toBe(2024);
      expect(transactions[0].date.getMonth()).toBe(1); // Fevereiro = 1
    });

    it('deve usar data atual se Data for inválida ou ausente', async () => {
      const excelData = [
        { Descrição: 'Sem data', Categoria: 'Vendas', Valor: 100, Tipo: 'RECEITA' },
      ];

      const buffer = createExcelBuffer(excelData);
      const before = new Date();
      const transactions = await adapter.processExcelFile(buffer, 'company-123');
      const after = new Date();

      expect(transactions).toHaveLength(1);
      expect(transactions[0].date).toBeInstanceOf(Date);
      expect(transactions[0].date.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(transactions[0].date.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('deve definir competenceDate e paymentDate iguais à date por padrão', async () => {
      const excelData = [
        { Data: '2024-01-15', Descrição: 'Teste', Categoria: 'Vendas', Valor: 100, Tipo: 'RECEITA' },
      ];

      const buffer = createExcelBuffer(excelData);
      const transactions = await adapter.processExcelFile(buffer, 'company-123');

      expect(transactions).toHaveLength(1);
      expect(transactions[0].competenceDate).toEqual(transactions[0].date);
      expect(transactions[0].paymentDate).toEqual(transactions[0].date);
    });

    it('deve processar arquivo Excel vazio retornando array vazio', async () => {
      const excelData: any[] = [];
      const buffer = createExcelBuffer(excelData);
      const transactions = await adapter.processExcelFile(buffer, 'company-123');

      expect(transactions).toHaveLength(0);
    });

    it('deve processar planilha com apenas cabeçalhos (sem dados)', async () => {
      // JSON vazio = apenas cabeçalhos na planilha
      const worksheet = XLSX.utils.aoa_to_sheet([['Data', 'Descrição', 'Categoria', 'Valor', 'Tipo']]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const transactions = await adapter.processExcelFile(buffer, 'company-123');

      expect(transactions).toHaveLength(0);
    });
  });
});
