import { ProcessExcelUseCase } from './process-excel.use-case';
import { IExcelProcessor } from '../../domain/ports/excel-processor.interface';
import { IFinancialRepository } from '../../domain/ports/financial-repository.interface';
import { FinancialTransaction } from '../../domain/entities/financial-transaction';
import { Money } from '../../domain/value-objects/money';
import { TransactionType } from '../../domain/value-objects/transaction-type';
import { Category } from '../../domain/value-objects/category';

describe('ProcessExcelUseCase', () => {
  let useCase: ProcessExcelUseCase;
  let mockExcelProcessor: jest.Mocked<IExcelProcessor>;
  let mockFinancialRepository: jest.Mocked<IFinancialRepository>;

  beforeEach(() => {
    mockExcelProcessor = {
      processExcelFile: jest.fn(),
    } as jest.Mocked<IExcelProcessor>;

    mockFinancialRepository = {
      save: jest.fn(),
      saveBatch: jest.fn(),
      findByCompanyId: jest.fn(),
      findByCompanyIdAndPeriod: jest.fn(),
      calculateSummary: jest.fn(),
      getMonthlyData: jest.fn(),
    } as jest.Mocked<IFinancialRepository>;

    useCase = new ProcessExcelUseCase(mockExcelProcessor, mockFinancialRepository);
  });

  const createMockTransaction = (): FinancialTransaction => {
    const moneyResult = Money.create(100);
    const typeResult = TransactionType.create('RECEITA');
    const categoryResult = Category.create('Vendas');

    const transactionResult = FinancialTransaction.create({
      companyId: 'company-123',
      date: new Date(),
      description: 'Teste',
      amount: moneyResult.getValue(),
      type: typeResult.getValue(),
      category: categoryResult.getValue(),
    });

    return transactionResult.getValue();
  };

  describe('execute', () => {
    it('deve processar Excel válido e persistir transações', async () => {
      const mockTransactions = [
        createMockTransaction(),
        createMockTransaction(),
        createMockTransaction(),
      ];

      mockExcelProcessor.processExcelFile.mockResolvedValue(mockTransactions);
      mockFinancialRepository.saveBatch.mockResolvedValue();

      const request = {
        companyId: 'company-123',
        userId: 'user-456',
        fileBuffer: Buffer.from('fake-excel-content'),
        fileName: 'test.xlsx',
      };

      const response = await useCase.execute(request);

      expect(mockExcelProcessor.processExcelFile).toHaveBeenCalledWith(
        request.fileBuffer,
        request.companyId,
      );
      expect(mockExcelProcessor.processExcelFile).toHaveBeenCalledTimes(1);

      expect(mockFinancialRepository.saveBatch).toHaveBeenCalledWith(mockTransactions);
      expect(mockFinancialRepository.saveBatch).toHaveBeenCalledTimes(1);

      expect(response.success).toBe(true);
      expect(response.totalTransactions).toBe(3);
      expect(response.message).toBe('3 transações processadas com sucesso');
    });

    it('deve falhar se companyId não for fornecido', async () => {
      const request = {
        companyId: '',
        userId: 'user-456',
        fileBuffer: Buffer.from('fake-excel-content'),
        fileName: 'test.xlsx',
      };

      await expect(useCase.execute(request)).rejects.toThrow('CompanyId e UserId são obrigatórios');

      expect(mockExcelProcessor.processExcelFile).not.toHaveBeenCalled();
      expect(mockFinancialRepository.saveBatch).not.toHaveBeenCalled();
    });

    it('deve falhar se userId não for fornecido', async () => {
      const request = {
        companyId: 'company-123',
        userId: '',
        fileBuffer: Buffer.from('fake-excel-content'),
        fileName: 'test.xlsx',
      };

      await expect(useCase.execute(request)).rejects.toThrow('CompanyId e UserId são obrigatórios');

      expect(mockExcelProcessor.processExcelFile).not.toHaveBeenCalled();
      expect(mockFinancialRepository.saveBatch).not.toHaveBeenCalled();
    });

    it('deve falhar se fileBuffer estiver vazio', async () => {
      const request = {
        companyId: 'company-123',
        userId: 'user-456',
        fileBuffer: Buffer.from(''),
        fileName: 'test.xlsx',
      };

      await expect(useCase.execute(request)).rejects.toThrow('Arquivo vazio');

      expect(mockExcelProcessor.processExcelFile).not.toHaveBeenCalled();
      expect(mockFinancialRepository.saveBatch).not.toHaveBeenCalled();
    });

    it('deve falhar se fileBuffer não for fornecido', async () => {
      const request = {
        companyId: 'company-123',
        userId: 'user-456',
        fileBuffer: null as any,
        fileName: 'test.xlsx',
      };

      await expect(useCase.execute(request)).rejects.toThrow('Arquivo vazio');

      expect(mockExcelProcessor.processExcelFile).not.toHaveBeenCalled();
      expect(mockFinancialRepository.saveBatch).not.toHaveBeenCalled();
    });

    it('deve falhar se Excel não contiver transações válidas', async () => {
      mockExcelProcessor.processExcelFile.mockResolvedValue([]);

      const request = {
        companyId: 'company-123',
        userId: 'user-456',
        fileBuffer: Buffer.from('fake-excel-content'),
        fileName: 'test.xlsx',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        'Nenhuma transação válida encontrada no arquivo',
      );

      expect(mockExcelProcessor.processExcelFile).toHaveBeenCalledTimes(1);
      expect(mockFinancialRepository.saveBatch).not.toHaveBeenCalled();
    });

    it('deve propagar erros do ExcelProcessor', async () => {
      const errorMessage = 'Erro ao parsear Excel';
      mockExcelProcessor.processExcelFile.mockRejectedValue(new Error(errorMessage));

      const request = {
        companyId: 'company-123',
        userId: 'user-456',
        fileBuffer: Buffer.from('fake-excel-content'),
        fileName: 'test.xlsx',
      };

      await expect(useCase.execute(request)).rejects.toThrow(errorMessage);

      expect(mockExcelProcessor.processExcelFile).toHaveBeenCalledTimes(1);
      expect(mockFinancialRepository.saveBatch).not.toHaveBeenCalled();
    });

    it('deve propagar erros do Repository', async () => {
      const mockTransactions = [createMockTransaction()];
      mockExcelProcessor.processExcelFile.mockResolvedValue(mockTransactions);

      const errorMessage = 'Erro ao salvar no DuckDB';
      mockFinancialRepository.saveBatch.mockRejectedValue(new Error(errorMessage));

      const request = {
        companyId: 'company-123',
        userId: 'user-456',
        fileBuffer: Buffer.from('fake-excel-content'),
        fileName: 'test.xlsx',
      };

      await expect(useCase.execute(request)).rejects.toThrow(errorMessage);

      expect(mockExcelProcessor.processExcelFile).toHaveBeenCalledTimes(1);
      expect(mockFinancialRepository.saveBatch).toHaveBeenCalledTimes(1);
    });

    it('deve processar com sucesso 1 transação', async () => {
      const mockTransactions = [createMockTransaction()];
      mockExcelProcessor.processExcelFile.mockResolvedValue(mockTransactions);
      mockFinancialRepository.saveBatch.mockResolvedValue();

      const request = {
        companyId: 'company-123',
        userId: 'user-456',
        fileBuffer: Buffer.from('fake-excel-content'),
        fileName: 'test.xlsx',
      };

      const response = await useCase.execute(request);

      expect(response.success).toBe(true);
      expect(response.totalTransactions).toBe(1);
      expect(response.message).toBe('1 transações processadas com sucesso');
    });

    it('deve processar com sucesso muitas transações (100+)', async () => {
      const mockTransactions = Array.from({ length: 150 }, () => createMockTransaction());
      mockExcelProcessor.processExcelFile.mockResolvedValue(mockTransactions);
      mockFinancialRepository.saveBatch.mockResolvedValue();

      const request = {
        companyId: 'company-123',
        userId: 'user-456',
        fileBuffer: Buffer.from('fake-excel-content'),
        fileName: 'test.xlsx',
      };

      const response = await useCase.execute(request);

      expect(response.success).toBe(true);
      expect(response.totalTransactions).toBe(150);
      expect(mockFinancialRepository.saveBatch).toHaveBeenCalledWith(mockTransactions);
    });
  });
});
