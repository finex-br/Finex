/**
 * DTOs para Application Layer
 */

export interface ProcessExcelRequestDTO {
  companyId: string;
  userId: string;
  fileBuffer: Buffer;
  fileName: string;
}

export interface ProcessExcelResponseDTO {
  success: boolean;
  totalTransactions: number;
  message: string;
}

export interface FinancialSummaryDTO {
  totalRevenue: number;
  totalExpense: number;
  profit: number;
}

export interface MonthlyDataDTO {
  month: string;
  revenue: number;
  expense: number;
}

/**
 * Enum para tipos de período
 */
export enum PeriodType {
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  SEMESTER = 'SEMESTER',
  YEAR = 'YEAR',
  CUSTOM = 'CUSTOM',
}

/**
 * DTO de filtro de período
 */
export interface PeriodFilterDTO {
  type: PeriodType;
  startDate?: string; // ISO 8601 (YYYY-MM-DD)
  endDate?: string;   // ISO 8601 (YYYY-MM-DD)
}

/**
 * DTO para gráfico de categorias
 */
export interface CategoryChartDataDTO {
  category: string;
  revenue: number;
  expense: number;
  total: number;
}

/**
 * DTO para gráfico de tendência
 */
export interface TrendChartDataDTO {
  date: string; // YYYY-MM-DD
  revenue: number;
  expense: number;
  profit: number;
}

export interface GetFinancialDataRequestDTO {
  companyId: string;
  userId: string;
  periodFilter?: PeriodFilterDTO;
}

/**
 * Metadados para UX inteligente do Dashboard
 * 
 * - totalTransactionsInSystem: Total de transações sem filtro (para detectar se fez upload)
 * - totalTransactionsInPeriod: Total de transações no período filtrado
 * - earliestDate: Data mais antiga no sistema (para sugerir períodos)
 * - latestDate: Data mais recente no sistema (para calcular filtros inteligentes)
 * - periodApplied: Período que foi realmente aplicado (para feedback ao usuário)
 */
export interface FinancialDataMetadataDTO {
  totalTransactionsInSystem: number;
  totalTransactionsInPeriod: number;
  earliestDate: string | null;  // ISO 8601 (YYYY-MM-DD) ou null se não há dados
  latestDate: string | null;    // ISO 8601 (YYYY-MM-DD) ou null se não há dados
  periodApplied: {
    type: PeriodType | null;
    startDate: string | null;
    endDate: string | null;
  };
}

export interface GetFinancialDataResponseDTO {
  summary: FinancialSummaryDTO;
  monthlyData: MonthlyDataDTO[];
  categoryData: CategoryChartDataDTO[];
  trendData: TrendChartDataDTO[];
  
  /** @deprecated Use metadata.periodApplied instead */
  period: {
    type: PeriodType;
    startDate: string;
    endDate: string;
  };
  
  /**
   * Metadados para UX inteligente
   * Permite diferenciar "sem upload" de "filtro vazio"
   */
  metadata: FinancialDataMetadataDTO;
}
