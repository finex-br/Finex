import { useState } from 'react';
import {
  financialService,
  FinancialSummary,
  MonthlyData,
} from '@/services/financialService';
import { AxiosError } from 'axios';

/**
 * useFinancialData - ViewModel Hook (MVVM Pattern)
 * 
 * Gerencia APENAS estado React e chama o service.
 * ZERO lógica de negócio (tudo está no backend).
 * 
 * Responsabilidades:
 * - Gerenciar estado local (loading, error, data)
 * - Chamar financialService
 * - Fornecer interface para Views
 */
export const useFinancialData = () => {
  // Estado para upload
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Estado para dados financeiros
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalExpense: 0,
    profit: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  /**
   * Faz upload do Excel (delega para o backend)
   */
  const uploadExcel = async (file: File, companyId?: string): Promise<boolean> => {
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const result = await financialService.uploadExcel(file, companyId);
      
      setUploadSuccess(true);
      return true;
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        'Erro ao fazer upload do arquivo';
      
      setUploadError(errorMessage);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Busca dados financeiros processados do backend
   */
  const fetchFinancialData = async (companyId?: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await financialService.getFinancialData(companyId);
      
      setSummary(data.summary);
      setMonthlyData(data.monthlyData);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        'Erro ao buscar dados financeiros';
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Limpa todos os dados (útil para logout ou troca de empresa)
   */
  const clearData = () => {
    setSummary({
      totalRevenue: 0,
      totalExpense: 0,
      profit: 0,
    });
    setMonthlyData([]);
    setError(null);
    setUploadError(null);
    setUploadSuccess(false);
  };

  return {
    // Upload state
    isUploading,
    uploadError,
    uploadSuccess,
    uploadExcel,

    // Data state
    isLoading,
    error,
    summary,
    monthlyData,
    fetchFinancialData,
    clearData,

    // Helper para verificar se há dados
    hasData: monthlyData.length > 0,
  };
};
