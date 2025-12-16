import { GetFinancialDataUseCase } from './get-financial-data.use-case';
import { IFinancialRepository } from '../../domain/ports/financial-repository.interface';
import {
  FinancialSummaryDTO,
  MonthlyDataDTO,
} from '../dtos/financial.dto';

describe('GetFinancialDataUseCase', () => {
  let useCase: GetFinancialDataUseCase;
  let mockFinancialRepository: jest.Mocked<IFinancialRepository>;

  beforeEach(() => {
    mockFinancialRepository = {
      save: jest.fn(),
      saveBatch: jest.fn(),
      findByCompanyId: jest.fn(),
      findByCompanyIdAndPeriod: jest.fn(),
      calculateSummary: jest.fn(),
      getMonthlyData: jest.fn(),
    } as jest.Mocked<IFinancialRepository>;

    useCase = new GetFinancialDataUseCase(mockFinancialRepository);
  });

  describe('execute', () => {
    it('deve buscar dados financeiros com sucesso', async () => {
      const mockSummary: FinancialSummaryDTO = {
        totalRevenue: 15000.00,
        totalExpense: 8500.50,
        profit: 6499.50,
      };

      const mockMonthlyData: MonthlyDataDTO[] = [
        { month: 'Jan/2024', revenue: 5000, expense: 3000 },
        { month: 'Fev/2024', revenue: 6000, expense: 3500 },
        { month: 'Mar/2024', revenue: 4000, expense: 2000 },
      ];

      mockFinancialRepository.calculateSummary.mockResolvedValue(mockSummary);
      mockFinancialRepository.getMonthlyData.mockResolvedValue(mockMonthlyData);

      const request = {
        companyId: 'company-123',
        userId: 'user-456',
      };

      const response = await useCase.execute(request);

      // Verificar que o Repository foi chamado corretamente
      expect(mockFinancialRepository.calculateSummary).toHaveBeenCalledWith('company-123');
      expect(mockFinancialRepository.calculateSummary).toHaveBeenCalledTimes(1);

      expect(mockFinancialRepository.getMonthlyData).toHaveBeenCalledWith('company-123');
      expect(mockFinancialRepository.getMonthlyData).toHaveBeenCalledTimes(1);

      // Verificar resposta
      expect(response.summary).toEqual(mockSummary);
      expect(response.summary.totalRevenue).toBe(15000.00);
      expect(response.summary.totalExpense).toBe(8500.50);
      expect(response.summary.profit).toBe(6499.50);

      expect(response.monthlyData).toEqual(mockMonthlyData);
      expect(response.monthlyData).toHaveLength(3);
    });

    it('deve falhar se companyId não for fornecido', async () => {
      const request = {
        companyId: '',
        userId: 'user-456',
      };

      await expect(useCase.execute(request)).rejects.toThrow('CompanyId e UserId são obrigatórios');

      // Não deve chamar o Repository
      expect(mockFinancialRepository.calculateSummary).not.toHaveBeenCalled();
      expect(mockFinancialRepository.getMonthlyData).not.toHaveBeenCalled();
    });

    it('deve falhar se userId não for fornecido', async () => {
      const request = {
        companyId: 'company-123',
        userId: '',
      };

      await expect(useCase.execute(request)).rejects.toThrow('CompanyId e UserId são obrigatórios');

      expect(mockFinancialRepository.calculateSummary).not.toHaveBeenCalled();
      expect(mockFinancialRepository.getMonthlyData).not.toHaveBeenCalled();
    });

    it('deve retornar summary com valores zerados se não houver transações', async () => {
      const mockSummary: FinancialSummaryDTO = {
        totalRevenue: 0,
        totalExpense: 0,
        profit: 0,
      };

      const mockMonthlyData: MonthlyDataDTO[] = [];

      mockFinancialRepository.calculateSummary.mockResolvedValue(mockSummary);
      mockFinancialRepository.getMonthlyData.mockResolvedValue(mockMonthlyData);

      const request = {
        companyId: 'company-123',
        userId: 'user-456',
      };

      const response = await useCase.execute(request);

      expect(response.summary.totalRevenue).toBe(0);
      expect(response.summary.totalExpense).toBe(0);
      expect(response.summary.profit).toBe(0);
      expect(response.monthlyData).toHaveLength(0);
    });

    it('deve propagar erros do Repository ao calcular summary', async () => {
      const errorMessage = 'Erro ao calcular summary no DuckDB';
      mockFinancialRepository.calculateSummary.mockRejectedValue(new Error(errorMessage));

      const request = {
        companyId: 'company-123',
        userId: 'user-456',
      };

      await expect(useCase.execute(request)).rejects.toThrow(errorMessage);

      expect(mockFinancialRepository.calculateSummary).toHaveBeenCalledTimes(1);
      // getMonthlyData não deve ser chamado se calculateSummary falhar
      expect(mockFinancialRepository.getMonthlyData).not.toHaveBeenCalled();
    });

    it('deve propagar erros do Repository ao buscar monthly data', async () => {
      const mockSummary: FinancialSummaryDTO = {
        totalRevenue: 1000,
        totalExpense: 500,
        profit: 500,
      };

      mockFinancialRepository.calculateSummary.mockResolvedValue(mockSummary);

      const errorMessage = 'Erro ao buscar dados mensais no DuckDB';
      mockFinancialRepository.getMonthlyData.mockRejectedValue(new Error(errorMessage));

      const request = {
        companyId: 'company-123',
        userId: 'user-456',
      };

      await expect(useCase.execute(request)).rejects.toThrow(errorMessage);

      expect(mockFinancialRepository.calculateSummary).toHaveBeenCalledTimes(1);
      expect(mockFinancialRepository.getMonthlyData).toHaveBeenCalledTimes(1);
    });

    it('deve processar corretamente dados com apenas receitas', async () => {
      const mockSummary: FinancialSummaryDTO = {
        totalRevenue: 10000,
        totalExpense: 0,
        profit: 10000,
      };

      const mockMonthlyData: MonthlyDataDTO[] = [
        { month: 'Jan/2024', revenue: 5000, expense: 0 },
        { month: 'Fev/2024', revenue: 5000, expense: 0 },
      ];

      mockFinancialRepository.calculateSummary.mockResolvedValue(mockSummary);
      mockFinancialRepository.getMonthlyData.mockResolvedValue(mockMonthlyData);

      const request = {
        companyId: 'company-123',
        userId: 'user-456',
      };

      const response = await useCase.execute(request);

      expect(response.summary.totalRevenue).toBe(10000);
      expect(response.summary.totalExpense).toBe(0);
      expect(response.summary.profit).toBe(10000);
    });

    it('deve processar corretamente dados com apenas despesas', async () => {
      const mockSummary: FinancialSummaryDTO = {
        totalRevenue: 0,
        totalExpense: 7500,
        profit: -7500,
      };

      const mockMonthlyData: MonthlyDataDTO[] = [
        { month: 'Jan/2024', revenue: 0, expense: 3000 },
        { month: 'Fev/2024', revenue: 0, expense: 4500 },
      ];

      mockFinancialRepository.calculateSummary.mockResolvedValue(mockSummary);
      mockFinancialRepository.getMonthlyData.mockResolvedValue(mockMonthlyData);

      const request = {
        companyId: 'company-123',
        userId: 'user-456',
      };

      const response = await useCase.execute(request);

      expect(response.summary.totalRevenue).toBe(0);
      expect(response.summary.totalExpense).toBe(7500);
      expect(response.summary.profit).toBe(-7500);
    });

    it('deve processar múltiplos meses de dados', async () => {
      const mockSummary: FinancialSummaryDTO = {
        totalRevenue: 72000,
        totalExpense: 48000,
        profit: 24000,
      };

      const mockMonthlyData: MonthlyDataDTO[] = [
        { month: 'Jan/2024', revenue: 6000, expense: 4000 },
        { month: 'Fev/2024', revenue: 6000, expense: 4000 },
        { month: 'Mar/2024', revenue: 6000, expense: 4000 },
        { month: 'Abr/2024', revenue: 6000, expense: 4000 },
        { month: 'Mai/2024', revenue: 6000, expense: 4000 },
        { month: 'Jun/2024', revenue: 6000, expense: 4000 },
        { month: 'Jul/2024', revenue: 6000, expense: 4000 },
        { month: 'Ago/2024', revenue: 6000, expense: 4000 },
        { month: 'Set/2024', revenue: 6000, expense: 4000 },
        { month: 'Out/2024', revenue: 6000, expense: 4000 },
        { month: 'Nov/2024', revenue: 6000, expense: 4000 },
        { month: 'Dez/2024', revenue: 6000, expense: 4000 },
      ];

      mockFinancialRepository.calculateSummary.mockResolvedValue(mockSummary);
      mockFinancialRepository.getMonthlyData.mockResolvedValue(mockMonthlyData);

      const request = {
        companyId: 'company-123',
        userId: 'user-456',
      };

      const response = await useCase.execute(request);

      expect(response.monthlyData).toHaveLength(12);
      expect(response.summary.profit).toBe(24000);
    });
  });
});
