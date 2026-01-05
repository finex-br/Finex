import { api } from './api';

/**
 * Enums e tipos alinhados com o backend
 */
export enum PeriodType {
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  SEMESTER = 'SEMESTER',
  YEAR = 'YEAR',
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
  revenue: number;
  expense: number;
  total: number;
}

export interface TrendData {
  date: string;
  revenue: number;
  expense: number;
  profit: number;
}

/**
 * NOVO (Lote 5): Graph-specific filter types
 * Permite filtros independentes para cada gráfico
 */
export enum GraphType {
  TREND = 'TREND',
  CATEGORY = 'CATEGORY',
  MONTHLY = 'MONTHLY',
}

export interface GraphFilters {
  trend?: PeriodFilter;
  category?: PeriodFilter;
  monthly?: PeriodFilter;
}

/**
 * Metadados retornados pelo backend (Lote 1)
 * Permite diferenciar estados: NO_UPLOAD, EMPTY_PERIOD, HAS_DATA
 */
export interface FinancialDataMetadata {
  totalTransactionsInSystem: number;  // Total de transações sem filtro (detecta "nunca fez upload")
  totalTransactionsInPeriod: number;   // Total de transações após aplicar filtro
  earliestDate: string | null;         // Data mais antiga nos dados (para sugestões ao usuário)
  latestDate: string | null;           // Data mais recente (para calcular filtros inteligentes)
  periodApplied: {
    type: PeriodType;
    startDate: string;
    endDate: string;
  };
}

export interface FinancialDataResponse {
  summary: FinancialSummary;
  monthlyData: MonthlyData[];
  categoryData: CategoryData[];
  trendData: TrendData[];
  metadata: FinancialDataMetadata;  // NOVO: metadados para UX inteligente
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
    const params: Record<string, string> = {};
    
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
