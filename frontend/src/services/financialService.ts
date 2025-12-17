import { api } from './api';

/**
 * Enums e tipos alinhados com o backend
 */
export enum PeriodType {
  MENSAL = 'MENSAL',
  TRIMESTRAL = 'TRIMESTRAL',
  SEMESTRAL = 'SEMESTRAL',
  ANUAL = 'ANUAL',
  CUSTOM = 'CUSTOM',
}

export interface PeriodFilter {
  type: PeriodType;
  startDate?: string;
  endDate?: string;
}

/**
 * DTOs alinhados com o backend
 */
export interface FinancialSummary {
  totalRevenue: number;
  totalExpense: number;
  profit: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  expense: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

export interface TrendData {
  date: string;
  amount: number;
}

export interface FinancialDataResponse {
  summary: FinancialSummary;
  monthlyData: MonthlyData[];
  categoryData: CategoryData[];
  trendData: TrendData[];
}

export interface UploadExcelResponse {
  success: boolean;
  totalTransactions: number;
  message: string;
}

/**
 * FinancialService - Infrastructure Layer (Frontend)
 * 
 * Thin Client: apenas faz requisições HTTP.
 * TODA lógica de negócio está no BACKEND.
 */
export const financialService = {
  /**
   * Faz upload de arquivo Excel para o backend processar
   * 
   * @param file - Arquivo Excel
   * @param companyId - ID da empresa (opcional, pode vir do JWT)
   * @returns Promise com resultado do processamento
   */
  uploadExcel: async (
    file: File,
    companyId?: string,
  ): Promise<UploadExcelResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (companyId) {
      formData.append('companyId', companyId);
    }

    const response = await api.post<UploadExcelResponse>(
      '/financial/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data;
  },

  /**
   * Busca dados financeiros processados (summary + monthly data + category data + trend data)
   * 
   * @param companyId - ID da empresa (opcional, pode vir do JWT)
   * @param periodFilter - Filtro de período (MENSAL, TRIMESTRAL, ANUAL, CUSTOM)
   * @returns Promise com dados agregados
   */
  getFinancialData: async (
    companyId?: string,
    periodFilter?: PeriodFilter
  ): Promise<FinancialDataResponse> => {
    const params: Record<string, any> = {};
    
    if (companyId) {
      params.companyId = companyId;
    }
    
    if (periodFilter) {
      params.period = periodFilter.type;
      
      if (periodFilter.type === PeriodType.CUSTOM) {
        if (periodFilter.startDate) {
          params.startDate = periodFilter.startDate;
        }
        if (periodFilter.endDate) {
          params.endDate = periodFilter.endDate;
        }
      }
    }
    
    const response = await api.get<FinancialDataResponse>(
      '/financial/data',
      { params },
    );

    return response.data;
  },
};
