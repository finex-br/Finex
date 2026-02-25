import { FinancialTransaction } from '../entities/financial-transaction';
import {
  SalesVolumeByMachineDTO,
  ProductMixPerformanceDTO,
  HardwareHealthDTO,
  AverageTicketTrendDTO,
} from '../../application/dtos/vending-machine-metrics.dto';

/**
 * IFinancialRepository - Port (Interface)
 * 
 * Define o contrato para persistência de transações financeiras.
 * Implementação em Infrastructure Layer (PostgreSQL/TypeORM).
 */
export interface IFinancialRepository {
  /**
   * Salva uma transação financeira
   */
  save(transaction: FinancialTransaction): Promise<void>;

  /**
   * Salva múltiplas transações em lote (performance)
   */
  saveBatch(transactions: FinancialTransaction[]): Promise<void>;

  /**
   * Busca transações de uma empresa
   */
  findByCompanyId(companyId: string): Promise<FinancialTransaction[]>;

  /**
   * Busca transações por período
   */
  findByCompanyIdAndPeriod(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<FinancialTransaction[]>;

  /**
   * Calcula agregações (SUM, AVG) para dashboard
   * @param companyId - ID da empresa
   * @param userId - ID do usuário
   * @param startDate - Data inicial do filtro (opcional)
   * @param endDate - Data final do filtro (opcional)
   */
  calculateSummary(
    companyId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalRevenue: number;
    totalExpense: number;
    profit: number;
  }>;

  /**
   * Agrupa transações por mês
   * @param companyId - ID da empresa
   * @param userId - ID do usuário
   * @param startDate - Data inicial do filtro (opcional)
   * @param endDate - Data final do filtro (opcional)
   */
  getMonthlyData(
    companyId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<
    Array<{
      month: string;
      revenue: number;
      expense: number;
    }>
  >;

  /**
   * Agrupa transações por categoria
   * @param companyId - ID da empresa
   * @param userId - ID do usuário
   * @param startDate - Data inicial do filtro (opcional)
   * @param endDate - Data final do filtro (opcional)
   */
  getCategoryData(
    companyId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<
    Array<{
      category: string;
      revenue: number;
      expense: number;
      total: number;
    }>
  >;

  /**
   * Retorna dados de tendência ao longo do tempo
   * @param companyId - ID da empresa
   * @param userId - ID do usuário
   * @param startDate - Data inicial do filtro (opcional)
   * @param endDate - Data final do filtro (opcional)
   * @param granularity - Granularidade dos dados (day, week, month)
   */
  getTrendData(
    companyId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date,
    granularity?: 'day' | 'week' | 'month',
  ): Promise<
    Array<{
      date: string;
      revenue: number;
      expense: number;
      profit: number;
    }>
  >;

  /**
   * Retorna o range de datas disponíveis no sistema para uma empresa
   * Usado para calcular filtros inteligentes e feedback ao usuário
   * 
   * @param companyId - ID da empresa
   * @returns { earliestDate, latestDate } ou { null, null } se não há dados
   */
  getDateRange(
    companyId: string,
  ): Promise<{
    earliestDate: Date | null;
    latestDate: Date | null;
  }>;

  /**
   * Conta total de transações no sistema (sem filtro)
   * Usado para diferenciar "nunca fez upload" de "filtro vazio"
   * 
   * @param companyId - ID da empresa
   * @returns Total de transações
   */
  countAll(companyId: string): Promise<number>;

  // ========================================
  // VENDING MACHINE OPERATIONAL METRICS
  // ========================================

  /**
   * Retorna volume de vendas agregado por máquina/dispositivo
   * Extrai dados do campo operational_metadata (JSONB)
   */
  getSalesVolumeByMachine(
    companyId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<SalesVolumeByMachineDTO[]>;

  /**
   * Retorna performance de produtos (mix de cafés, etc.)
   * Extrai dados do campo operational_metadata->>'blend'
   */
  getProductMixPerformance(
    companyId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ProductMixPerformanceDTO[]>;

  /**
   * Retorna status de saúde de hardware (nivelGalao)
   * Busca última leitura de cada dispositivo
   */
  getHardwareHealthStatus(
    companyId: string,
  ): Promise<HardwareHealthDTO[]>;

  /**
   * Retorna tendência de ticket médio ao longo do tempo
   */
  getAverageTicketTrend(
    companyId: string,
    startDate?: Date,
    endDate?: Date,
    granularity?: 'day' | 'week' | 'month',
  ): Promise<AverageTicketTrendDTO[]>;
}
