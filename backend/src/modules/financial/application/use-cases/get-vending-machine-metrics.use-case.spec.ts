import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { GetVendingMachineMetricsUseCase } from './get-vending-machine-metrics.use-case';
import { IFinancialRepository } from '../../domain/ports/financial-repository.interface';

describe('GetVendingMachineMetricsUseCase', () => {
  let useCase: GetVendingMachineMetricsUseCase;
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
      getTrendData: jest.fn(),
      getDateRange: jest.fn(),
      countAll: jest.fn(),
      getSalesVolumeByMachine: jest.fn(),
      getProductMixPerformance: jest.fn(),
      getHardwareHealthStatus: jest.fn(),
      getAverageTicketTrend: jest.fn(),
    } as jest.Mocked<IFinancialRepository>;

    useCase = new GetVendingMachineMetricsUseCase(mockFinancialRepository);
  });

  describe('execute', () => {
    it('deve retornar métricas de máquinas de venda quando dados existem', async () => {
      // Arrange
      const request = {
        companyId: 'company-123',
        userId: 'user-123',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-02-28'),
      };

      mockFinancialRepository.getSalesVolumeByMachine.mockResolvedValue([
        { deviceId: 'Kombi_Mushspresso', totalSales: 100, totalRevenue: 550.00, averageTicket: 5.50 },
        { deviceId: 'VUP_702', totalSales: 80, totalRevenue: 440.00, averageTicket: 5.50 },
      ]);

      mockFinancialRepository.getProductMixPerformance.mockResolvedValue([
        { product: 'qCafe1', salesCount: 50, totalRevenue: 275.00, percentage: 50.0 },
        { product: 'qCafe2', salesCount: 30, totalRevenue: 165.00, percentage: 30.0 },
        { product: 'qCafe3', salesCount: 20, totalRevenue: 110.00, percentage: 20.0 },
      ]);

      mockFinancialRepository.getHardwareHealthStatus.mockResolvedValue([
        { deviceId: 'Kombi_Mushspresso', nivelGalao: 72, status: 'HEALTHY', lastUpdate: '2026-02-06' },
        { deviceId: 'VUP_702', nivelGalao: 30, status: 'WARNING', lastUpdate: '2026-02-06' },
      ]);

      mockFinancialRepository.getAverageTicketTrend.mockResolvedValue([
        { date: '2026-02-01', averageTicket: 5.50, transactionCount: 10 },
        { date: '2026-02-02', averageTicket: 5.50, transactionCount: 12 },
      ]);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.salesByMachine).toHaveLength(2);
      expect(result.salesByMachine[0].deviceId).toBe('Kombi_Mushspresso');
      expect(result.salesByMachine[0].totalSales).toBe(100);
      expect(result.salesByMachine[0].totalRevenue).toBe(550.00);

      expect(result.productMix).toHaveLength(3);
      expect(result.productMix[0].product).toBe('qCafe1');

      expect(result.hardwareHealth).toHaveLength(2);
      expect(result.hardwareHealth[0].status).toBe('HEALTHY');
      expect(result.hardwareHealth[1].status).toBe('WARNING');

      expect(result.averageTicketTrend).toHaveLength(2);

      expect(result.summary).toBeDefined();
      expect(result.summary.totalMachines).toBe(2);
      expect(result.summary.totalSales).toBe(180);
      expect(result.summary.healthyMachines).toBe(1);
      expect(result.summary.warningMachines).toBe(1);
      expect(result.summary.criticalMachines).toBe(0);
    });

    it('deve retornar métricas vazias quando não há dados operacionais', async () => {
      // Arrange
      const request = {
        companyId: 'company-123',
        userId: 'user-123',
      };

      mockFinancialRepository.getSalesVolumeByMachine.mockResolvedValue([]);
      mockFinancialRepository.getProductMixPerformance.mockResolvedValue([]);
      mockFinancialRepository.getHardwareHealthStatus.mockResolvedValue([]);
      mockFinancialRepository.getAverageTicketTrend.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.salesByMachine).toHaveLength(0);
      expect(result.productMix).toHaveLength(0);
      expect(result.hardwareHealth).toHaveLength(0);
      expect(result.averageTicketTrend).toHaveLength(0);

      expect(result.summary.totalMachines).toBe(0);
      expect(result.summary.totalSales).toBe(0);
      expect(result.summary.healthyMachines).toBe(0);
      expect(result.summary.warningMachines).toBe(0);
      expect(result.summary.criticalMachines).toBe(0);
    });

    it('deve calcular corretamente o status de saúde das máquinas', async () => {
      // Arrange
      const request = {
        companyId: 'company-123',
        userId: 'user-123',
      };

      mockFinancialRepository.getSalesVolumeByMachine.mockResolvedValue([
        { deviceId: 'Machine1', totalSales: 50, totalRevenue: 275.00, averageTicket: 5.50 },
        { deviceId: 'Machine2', totalSales: 50, totalRevenue: 275.00, averageTicket: 5.50 },
        { deviceId: 'Machine3', totalSales: 50, totalRevenue: 275.00, averageTicket: 5.50 },
      ]);

      mockFinancialRepository.getProductMixPerformance.mockResolvedValue([]);

      mockFinancialRepository.getHardwareHealthStatus.mockResolvedValue([
        { deviceId: 'Machine1', nivelGalao: 75, status: 'HEALTHY', lastUpdate: '2026-02-06' },
        { deviceId: 'Machine2', nivelGalao: 28, status: 'WARNING', lastUpdate: '2026-02-06' },
        { deviceId: 'Machine3', nivelGalao: 12, status: 'CRITICAL', lastUpdate: '2026-02-06' },
      ]);

      mockFinancialRepository.getAverageTicketTrend.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.summary.totalMachines).toBe(3);
      expect(result.summary.healthyMachines).toBe(1);
      expect(result.summary.warningMachines).toBe(1);
      expect(result.summary.criticalMachines).toBe(1);
    });

    it('deve funcionar com datas opcionais (período completo)', async () => {
      // Arrange
      const request = {
        companyId: 'company-123',
        userId: 'user-123',
        // sem startDate e endDate
      };

      mockFinancialRepository.getSalesVolumeByMachine.mockResolvedValue([]);
      mockFinancialRepository.getProductMixPerformance.mockResolvedValue([]);
      mockFinancialRepository.getHardwareHealthStatus.mockResolvedValue([]);
      mockFinancialRepository.getAverageTicketTrend.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(mockFinancialRepository.getSalesVolumeByMachine).toHaveBeenCalledWith('company-123', undefined, undefined);
      expect(mockFinancialRepository.getProductMixPerformance).toHaveBeenCalledWith('company-123', undefined, undefined);
      expect(mockFinancialRepository.getHardwareHealthStatus).toHaveBeenCalledWith('company-123');
      expect(mockFinancialRepository.getAverageTicketTrend).toHaveBeenCalledWith('company-123', undefined, undefined, 'day');
    });
  });
});
