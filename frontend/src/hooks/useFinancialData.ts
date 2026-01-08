import { useState, useMemo } from 'react';
import {
  financialService,
  FinancialSummary,
  MonthlyData,
  CategoryData,
  TrendData,
  PeriodFilter,
  PeriodType,
  FinancialDataMetadata,
  GraphFilters,
  GraphType,
} from '@/services/financialService';
import { AxiosError } from 'axios';

/**
 * Estados possíveis do Dashboard (Lote 3)
 * Baseado em metadata.totalTransactionsInSystem e metadata.totalTransactionsInPeriod
 */
export enum DashboardState {
  LOADING = 'LOADING',           // Carregando dados
  NO_UPLOAD = 'NO_UPLOAD',       // Nunca fez upload (totalTransactionsInSystem === 0)
  EMPTY_PERIOD = 'EMPTY_PERIOD', // Filtro retornou vazio (totalTransactionsInPeriod === 0, mas totalTransactionsInSystem > 0)
  HAS_DATA = 'HAS_DATA',         // Tem dados para exibir
}

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
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  
  // NOVO (Lote 3): Metadados do backend
  const [metadata, setMetadata] = useState<FinancialDataMetadata | null>(null);

  // Estado para filtro de período
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter | undefined>(undefined);

  // NOVO (Lote 5): Filtros individuais por gráfico
  const [graphFilters, setGraphFilters] = useState<GraphFilters>({});

  /**
   * NOVO (Lote 5): Define filtro para um gráfico específico
   */
  const setGraphFilter = (graphType: GraphType, filter: PeriodFilter | undefined) => {
    setGraphFilters(prev => ({
      ...prev,
      [graphType.toLowerCase()]: filter,
    }));
  };

  /**
   * NOVO (Lote 5): Reseta filtro de um gráfico para usar o filtro global
   */
  const resetGraphFilter = (graphType: GraphType) => {
    setGraphFilters(prev => {
      const updated = { ...prev };
      delete updated[graphType.toLowerCase() as keyof GraphFilters];
      return updated;
    });
  };

  /**
   * NOVO (Lote 5): Retorna o filtro efetivo para um gráfico
   * (filtro individual ou global)
   */
  const getEffectiveFilter = (graphType: GraphType): PeriodFilter | undefined => {
    const graphFilterKey = graphType.toLowerCase() as keyof GraphFilters;
    return graphFilters[graphFilterKey] || periodFilter;
  };

  /**
   * Estado do Dashboard calculado baseado em metadata (Lote 3)
   * 
   * Lógica:
   * - LOADING: Ainda não tem metadata
   * - NO_UPLOAD: totalTransactionsInSystem === 0 (nunca fez upload)
   * - EMPTY_PERIOD: totalTransactionsInPeriod === 0 mas totalTransactionsInSystem > 0 (filtro vazio)
   * - HAS_DATA: totalTransactionsInPeriod > 0 (tem dados para exibir)
   */
  const dashboardState = useMemo((): DashboardState => {
    if (!metadata) return DashboardState.LOADING;
    if (metadata.totalTransactionsInSystem === 0) return DashboardState.NO_UPLOAD;
    if (metadata.totalTransactionsInPeriod === 0) return DashboardState.EMPTY_PERIOD;
    return DashboardState.HAS_DATA;
  }, [metadata]);

  /**
   * Faz upload do Excel (delega para o backend)
   */
  const uploadExcel = async (file: File, companyId?: string): Promise<boolean> => {
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      console.log('[useFinancialData] Iniciando upload...', { fileName: file.name, companyId });
      const result = await financialService.uploadExcel(file, companyId);
      console.log('[useFinancialData] Resposta do backend:', result);
      
      // Verificar se o backend retornou sucesso
      if (result.success) {
        console.log('[useFinancialData] Upload bem-sucedido!');
        setUploadSuccess(true);
        return true;
      } else {
        console.log('[useFinancialData] Upload falhou:', result.message);
        setUploadError(result.message || 'Falha ao processar arquivo');
        return false;
      }
    } catch (err) {
      console.error('[useFinancialData] Erro no upload:', err);
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
      console.log('[useFinancialData] Buscando dados...', { companyId, periodFilter });
      const data = await financialService.getFinancialData(companyId, periodFilter);
      
      // Salvar dados
      setSummary(data.summary);
      setMonthlyData(data.monthlyData);
      setCategoryData(data.categoryData);
      setTrendData(data.trendData);
      
      // NOVO (Lote 3): Salvar metadata
      setMetadata(data.metadata);
      
      console.log('[useFinancialData] Metadata recebido:', data.metadata);
      console.log('[useFinancialData] Dashboard State será:', 
        data.metadata.totalTransactionsInSystem === 0 ? 'NO_UPLOAD' :
        data.metadata.totalTransactionsInPeriod === 0 ? 'EMPTY_PERIOD' : 'HAS_DATA'
      );
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        'Erro ao buscar dados financeiros';
      
      console.error('[useFinancialData] Erro ao buscar dados:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * NOVO (Lote 5): Busca dados para um gráfico específico com filtro individual
   */
  const fetchGraphData = async (
    graphType: GraphType,
    companyId?: string,
    filter?: PeriodFilter
  ): Promise<void> => {
    try {
      console.log('[useFinancialData] Buscando dados para gráfico:', { graphType, filter });
      const data = await financialService.getFinancialData(companyId, filter);
      
      // Atualizar apenas os dados do gráfico específico
      switch (graphType) {
        case GraphType.TREND:
          setTrendData(data.trendData);
          break;
        case GraphType.CATEGORY:
          setCategoryData(data.categoryData);
          break;
        case GraphType.MONTHLY:
          setMonthlyData(data.monthlyData);
          break;
      }
      
      console.log('[useFinancialData] Dados do gráfico atualizados:', graphType);
    } catch (err) {
      console.error('[useFinancialData] Erro ao buscar dados do gráfico:', err);
      // Não definimos erro global aqui para não afetar todo o dashboard
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
    setCategoryData([]);
    setTrendData([]);
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
    categoryData,
    trendData,
    fetchFinancialData,
    clearData,

    // Period filter
    periodFilter,
    setPeriodFilter,

    // NOVO (Lote 3): Metadata e estado inteligente
    metadata,
    dashboardState,  // Use ESTE em vez de hasData!

    // NOVO (Lote 5): Filtros individuais por gráfico
    graphFilters,
    setGraphFilter,
    resetGraphFilter,
    getEffectiveFilter,
    fetchGraphData,
  };
};
