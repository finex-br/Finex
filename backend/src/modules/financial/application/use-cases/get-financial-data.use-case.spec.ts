import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GetFinancialDataUseCase } from './get-financial-data.use-case';
import { IFinancialRepository } from '../../domain/ports/financial-repository.interface';
import {
  FinancialSummaryDTO,
  MonthlyDataDTO,
  PeriodType,
  CategoryChartDataDTO,
  TrendChartDataDTO,
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
      getCategoryData: jest.fn(),
      getTrendData: jest.fn(),      getDateRange: jest.fn(),
      countAll: jest.fn(),    } as jest.Mocked<IFinancialRepository>;

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
      expect(mockFinancialRepository.calculateSummary).toHaveBeenCalledWith(
        'company-123',
        'user-456',
        undefined,
        undefined,
      );
      expect(mockFinancialRepository.calculateSummary).toHaveBeenCalledTimes(1);

      expect(mockFinancialRepository.getMonthlyData).toHaveBeenCalledWith(
        'company-123',
        'user-456',
        undefined,
        undefined,
      );
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

      // Mock outros métodos para retornar valores (Promise.all executa todos)
      mockFinancialRepository.getMonthlyData.mockResolvedValue([]);
      mockFinancialRepository.getCategoryData.mockResolvedValue([]);
      mockFinancialRepository.getTrendData.mockResolvedValue([]);

      const request = {
        companyId: 'company-123',
        userId: 'user-456',
      };

      await expect(useCase.execute(request)).rejects.toThrow(errorMessage);

      expect(mockFinancialRepository.calculateSummary).toHaveBeenCalledTimes(1);
      // Com Promise.all, outros métodos ainda são chamados mesmo se um falhar
      expect(mockFinancialRepository.getMonthlyData).toHaveBeenCalledTimes(1);
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

  describe('execute com filtros de período', () => {
    const mockSummary: FinancialSummaryDTO = {
      totalRevenue: 5000,
      totalExpense: 3000,
      profit: 2000,
    };

    const mockMonthlyData: MonthlyDataDTO[] = [
      { month: 'Jan/2024', revenue: 5000, expense: 3000 },
    ];

    const mockCategoryData: CategoryChartDataDTO[] = [
      { category: 'Vendas', revenue: 5000, expense: 0, total: 5000 },
      { category: 'Despesas Operacionais', revenue: 0, expense: 3000, total: -3000 },
    ];

    const mockTrendData: TrendChartDataDTO[] = [
      { date: '2024-01-01', revenue: 1000, expense: 600, profit: 400 },
      { date: '2024-01-02', revenue: 1500, expense: 900, profit: 600 },
    ];

    beforeEach(() => {
      mockFinancialRepository.calculateSummary.mockResolvedValue(mockSummary);
      mockFinancialRepository.getMonthlyData.mockResolvedValue(mockMonthlyData);
      mockFinancialRepository.getCategoryData.mockResolvedValue(mockCategoryData);
      mockFinancialRepository.getTrendData.mockResolvedValue(mockTrendData);
    });

    it('deve executar sem filtro (default: último ano)', async () => {
      const request = {
        companyId: 'company-123',
        userId: 'user-456',
      };

      const response = await useCase.execute(request);

      // Deve chamar repository sem datas (NULL)
      expect(mockFinancialRepository.calculateSummary).toHaveBeenCalledWith(
        'company-123',
        'user-456',
        undefined,
        undefined,
      );

      expect(response.summary).toEqual(mockSummary);
      expect(response.categoryData).toEqual(mockCategoryData);
      expect(response.trendData).toEqual(mockTrendData);
      expect(response.period.type).toBe(PeriodType.YEAR);
    });

    it('deve executar com filtro WEEK', async () => {
      const request = {
        companyId: 'company-123',
        userId: 'user-456',
        periodFilter: { type: PeriodType.WEEK },
      };

      const response = await useCase.execute(request);

      // Deve chamar repository com datas (últimos 7 dias)
      const callArgs = mockFinancialRepository.calculateSummary.mock.calls[0];
      expect(callArgs[0]).toBe('company-123');
      expect(callArgs[1]).toBe('user-456');
      expect(callArgs[2]).toBeInstanceOf(Date); // startDate
      expect(callArgs[3]).toBeInstanceOf(Date); // endDate

      expect(response.period.type).toBe(PeriodType.WEEK);
      expect(mockFinancialRepository.getTrendData).toHaveBeenCalledWith(
        'company-123',
        'user-456',
        expect.any(Date),
        expect.any(Date),
        'day', // Granularidade para WEEK
      );
    });

    it('deve executar com filtro MONTH', async () => {
      const request = {
        companyId: 'company-123',
        userId: 'user-456',
        periodFilter: { type: PeriodType.MONTH },
      };

      const response = await useCase.execute(request);

      expect(response.period.type).toBe(PeriodType.MONTH);
      expect(mockFinancialRepository.getTrendData).toHaveBeenCalledWith(
        'company-123',
        'user-456',
        expect.any(Date),
        expect.any(Date),
        'day', // Granularidade para MONTH
      );
    });

    it('deve executar com filtro QUARTER', async () => {
      const request = {
        companyId: 'company-123',
        userId: 'user-456',
        periodFilter: { type: PeriodType.QUARTER },
      };

      const response = await useCase.execute(request);

      expect(response.period.type).toBe(PeriodType.QUARTER);
      expect(mockFinancialRepository.getTrendData).toHaveBeenCalledWith(
        'company-123',
        'user-456',
        expect.any(Date),
        expect.any(Date),
        'week', // Granularidade para QUARTER
      );
    });

    it('deve executar com filtro SEMESTER', async () => {
      const request = {
        companyId: 'company-123',
        userId: 'user-456',
        periodFilter: { type: PeriodType.SEMESTER },
      };

      const response = await useCase.execute(request);

      expect(response.period.type).toBe(PeriodType.SEMESTER);
      expect(mockFinancialRepository.getTrendData).toHaveBeenCalledWith(
        'company-123',
        'user-456',
        expect.any(Date),
        expect.any(Date),
        'week', // Granularidade para SEMESTER
      );
    });

    it('deve executar com filtro YEAR', async () => {
      const request = {
        companyId: 'company-123',
        userId: 'user-456',
        periodFilter: { type: PeriodType.YEAR },
      };

      const response = await useCase.execute(request);

      expect(response.period.type).toBe(PeriodType.YEAR);
      expect(mockFinancialRepository.getTrendData).toHaveBeenCalledWith(
        'company-123',
        'user-456',
        expect.any(Date),
        expect.any(Date),
        'month', // Granularidade para YEAR
      );
    });

    it('deve executar com filtro CUSTOM (datas válidas)', async () => {
      const request = {
        companyId: 'company-123',
        userId: 'user-456',
        periodFilter: {
          type: PeriodType.CUSTOM,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
      };

      const response = await useCase.execute(request);

      const callArgs = mockFinancialRepository.calculateSummary.mock.calls[0];
      expect(callArgs[2]).toEqual(new Date('2024-01-01'));
      expect(callArgs[3]).toEqual(new Date('2024-12-31'));

      expect(response.period.type).toBe(PeriodType.CUSTOM);
      expect(response.period.startDate).toBe('2024-01-01');
      expect(response.period.endDate).toBe('2024-12-31');
    });

    it('deve falhar com filtro CUSTOM inválido (sem startDate)', async () => {
      const request = {
        companyId: 'company-123',
        userId: 'user-456',
        periodFilter: {
          type: PeriodType.CUSTOM,
          endDate: '2024-12-31',
        },
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        'Período customizado requer startDate e endDate',
      );

      expect(mockFinancialRepository.calculateSummary).not.toHaveBeenCalled();
    });

    it('deve falhar com filtro CUSTOM inválido (startDate > endDate)', async () => {
      const request = {
        companyId: 'company-123',
        userId: 'user-456',
        periodFilter: {
          type: PeriodType.CUSTOM,
          startDate: '2024-12-31',
          endDate: '2024-01-01',
        },
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        'startDate não pode ser maior que endDate',
      );

      expect(mockFinancialRepository.calculateSummary).not.toHaveBeenCalled();
    });

    it('deve passar datas corretas para todos os métodos do repository', async () => {
      const request = {
        companyId: 'company-123',
        userId: 'user-456',
        periodFilter: {
          type: PeriodType.CUSTOM,
          startDate: '2024-01-01',
          endDate: '2024-06-30',
        },
      };

      await useCase.execute(request);

      const expectedStartDate = new Date('2024-01-01');
      const expectedEndDate = new Date('2024-06-30');

      // Verificar que TODOS os métodos receberam as datas
      expect(mockFinancialRepository.calculateSummary).toHaveBeenCalledWith(
        'company-123',
        'user-456',
        expectedStartDate,
        expectedEndDate,
      );

      expect(mockFinancialRepository.getMonthlyData).toHaveBeenCalledWith(
        'company-123',
        'user-456',
        expectedStartDate,
        expectedEndDate,
      );

      expect(mockFinancialRepository.getCategoryData).toHaveBeenCalledWith(
        'company-123',
        'user-456',
        expectedStartDate,
        expectedEndDate,
      );

      expect(mockFinancialRepository.getTrendData).toHaveBeenCalledWith(
        'company-123',
        'user-456',
        expectedStartDate,
        expectedEndDate,
        'month',
      );
    });

    it('deve retornar categoryData corretamente', async () => {
      const request = {
        companyId: 'company-123',
        userId: 'user-456',
      };

      const response = await useCase.execute(request);

      expect(response.categoryData).toEqual(mockCategoryData);
      expect(response.categoryData).toHaveLength(2);
      expect(response.categoryData[0].category).toBe('Vendas');
      expect(response.categoryData[0].total).toBe(5000);
    });

    it('deve retornar trendData corretamente', async () => {
      const request = {
        companyId: 'company-123',
        userId: 'user-456',
      };

      const response = await useCase.execute(request);

      expect(response.trendData).toEqual(mockTrendData);
      expect(response.trendData).toHaveLength(2);
      expect(response.trendData[0].date).toBe('2024-01-01');
      expect(response.trendData[0].profit).toBe(400);
    });

    it('deve retornar metadados de período corretamente', async () => {
      const request = {
        companyId: 'company-123',
        userId: 'user-456',
        periodFilter: { type: PeriodType.MONTH },
      };

      const response = await useCase.execute(request);

      expect(response.period).toBeDefined();
      expect(response.period.type).toBe(PeriodType.MONTH);
      expect(response.period.startDate).toMatch(/\d{4}-\d{2}-\d{2}/);
      expect(response.period.endDate).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
  });
});
