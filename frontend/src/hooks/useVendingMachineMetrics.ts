import { useState } from 'react';
import {
  vendingMachineService,
  VendingMachineMetricsResponse,
  SalesVolumeByMachine,
  ProductMixPerformance,
  HardwareHealth,
  AverageTicketTrend,
  VendingMachineMetricsSummary,
} from '@/services/vendingMachineService';
import { AxiosError } from 'axios';

/**
 * useVendingMachineMetrics - ViewModel Hook (MVVM Pattern)
 * 
 * Manages vending machine operational metrics state.
 * Follows the same pattern as useFinancialData.
 * 
 * Responsibilities:
 * - Manage local state (loading, error, data)
 * - Call vendingMachineService
 * - Provide interface for Views
 */
export const useVendingMachineMetrics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [salesByMachine, setSalesByMachine] = useState<SalesVolumeByMachine[]>([]);
  const [productMix, setProductMix] = useState<ProductMixPerformance[]>([]);
  const [hardwareHealth, setHardwareHealth] = useState<HardwareHealth[]>([]);
  const [averageTicketTrend, setAverageTicketTrend] = useState<AverageTicketTrend[]>([]);
  const [summary, setSummary] = useState<VendingMachineMetricsSummary>({
    totalMachines: 0,
    totalSales: 0,
    totalRevenue: 0,
    averageTicket: 0,
    healthyMachines: 0,
    warningMachines: 0,
    criticalMachines: 0,
  });

  // Period filter for vending metrics
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  /**
   * Fetch vending machine metrics from backend
   */
  const fetchVendingMetrics = async (start?: string, end?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useVendingMachineMetrics] Fetching data:', { start, end });
      
      const response: VendingMachineMetricsResponse = await vendingMachineService.getVendingMachineMetrics(
        start || startDate,
        end || endDate,
      );

      console.log('[useVendingMachineMetrics] Data received:', response);

      setSalesByMachine(response.salesByMachine);
      setProductMix(response.productMix);
      setHardwareHealth(response.hardwareHealth);
      setAverageTicketTrend(response.averageTicketTrend);
      setSummary(response.summary);
    } catch (err) {
      console.error('[useVendingMachineMetrics] Error:', err);
      
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || err.message || 'Erro ao buscar métricas operacionais');
      } else {
        setError('Erro desconhecido ao buscar métricas operacionais');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update period filter and refetch data
   */
  const setPeriodFilter = (start?: string, end?: string) => {
    setStartDate(start);
    setEndDate(end);
    fetchVendingMetrics(start, end);
  };

  return {
    // State
    salesByMachine,
    productMix,
    hardwareHealth,
    averageTicketTrend,
    summary,
    isLoading,
    error,
    startDate,
    endDate,

    // Actions
    fetchVendingMetrics,
    setPeriodFilter,
  };
};
