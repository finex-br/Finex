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

export interface GetFinancialDataRequestDTO {
  companyId: string;
  userId: string;
}

export interface GetFinancialDataResponseDTO {
  summary: FinancialSummaryDTO;
  monthlyData: MonthlyDataDTO[];
}
