import { api } from './api';

/**
 * DTOs aligned with backend (vending-machine-metrics.dto.ts)
 */
export interface SalesVolumeByMachine {
  deviceId: string;
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  location?: string;
}

export interface ProductMixPerformance {
  product: string;
  salesCount: number;
  totalRevenue: number;
  percentage: number;
}

export interface HardwareHealth {
  deviceId: string;
  nivelGalao: number | null;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  lastUpdate: string;
  location?: string;
}

export interface AverageTicketTrend {
  date: string;
  averageTicket: number;
  transactionCount: number;
}

export interface VendingMachineMetricsSummary {
  totalMachines: number;
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  healthyMachines: number;
  warningMachines: number;
  criticalMachines: number;
}

export interface VendingMachineMetricsResponse {
  salesByMachine: SalesVolumeByMachine[];
  productMix: ProductMixPerformance[];
  hardwareHealth: HardwareHealth[];
  averageTicketTrend: AverageTicketTrend[];
  summary: VendingMachineMetricsSummary;
}

/**
 * VendingMachineService - Infrastructure Layer (Frontend)
 * 
 * Thin Client: apenas faz requisições HTTP para o endpoint de métricas operacionais.
 * TODA lógica de negócio está no BACKEND.
 */
export const vendingMachineService = {
  /**
   * Busca métricas operacionais de máquinas de vending
   * 
   * @param startDate - Data inicial (opcional, formato YYYY-MM-DD)
   * @param endDate - Data final (opcional, formato YYYY-MM-DD)
   * @returns Promise com métricas agregadas
   */
  getVendingMachineMetrics: async (
    startDate?: string,
    endDate?: string,
  ): Promise<VendingMachineMetricsResponse> => {
    const params: Record<string, string> = {};
    
    if (startDate) {
      params.startDate = startDate;
    }
    if (endDate) {
      params.endDate = endDate;
    }

    const response = await api.get<VendingMachineMetricsResponse>(
      '/financial/vending-metrics',
      { params }
    );

    return response.data;
  },
};
