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
  periodFilter?: PeriodFilterDTO; // NOVO
}

export interface GetFinancialDataResponseDTO {
  summary: FinancialSummaryDTO;
  monthlyData: MonthlyDataDTO[];
  categoryData: CategoryChartDataDTO[]; // NOVO
  trendData: TrendChartDataDTO[];       // NOVO
  period: {                              // NOVO - Metadados do período
    type: PeriodType;
    startDate: string;
    endDate: string;
  };
}
