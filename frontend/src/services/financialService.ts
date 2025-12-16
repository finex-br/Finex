import { api } from './api';

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

export interface FinancialDataResponse {
  summary: FinancialSummary;
  monthlyData: MonthlyData[];
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
   * Busca dados financeiros processados (summary + monthly data)
   * 
   * @param companyId - ID da empresa (opcional, pode vir do JWT)
   * @returns Promise com dados agregados
   */
  getFinancialData: async (companyId?: string): Promise<FinancialDataResponse> => {
    const params = companyId ? { companyId } : {};
    
    const response = await api.get<FinancialDataResponse>(
      '/financial/data',
      { params },
    );

    return response.data;
  },
};
