/**
 * DTOs for Vending Machine Operational Metrics
 * 
 * These DTOs support operational dashboards for vending machine businesses,
 * tracking sales volume, product mix, hardware health, and average ticket values.
 */

/**
 * Sales volume aggregated by device/machine
 */
export interface SalesVolumeByMachineDTO {
  deviceId: string;
  totalSales: number;      // Total number of transactions
  totalRevenue: number;    // Total amount in BRL
  averageTicket: number;   // Average transaction value
  location?: string;       // Optional location metadata
}

/**
 * Product mix performance (coffee blends, etc.)
 */
export interface ProductMixPerformanceDTO {
  product: string;         // e.g., "qCafe1", "qCafe2", "qCafe3"
  salesCount: number;      // Number of units sold
  totalRevenue: number;    // Revenue from this product
  percentage: number;      // Percentage of total sales
}

/**
 * Hardware health status alerts
 */
export interface HardwareHealthDTO {
  deviceId: string;
  nivelGalao: number | null;  // Current galao level (0-100%)
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';  // Based on thresholds
  lastUpdate: string;         // ISO date of last reading
  location?: string;
}

/**
 * Average ticket value trend over time
 */
export interface AverageTicketTrendDTO {
  date: string;            // Date or period (e.g., "2026-02-06" or "2026-02")
  averageTicket: number;   // Average transaction value
  transactionCount: number; // Number of transactions
}

/**
 * Request DTO for fetching vending machine metrics
 */
export interface GetVendingMachineMetricsRequestDTO {
  companyId: string;
  userId: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Response DTO with all vending machine metrics
 */
export interface GetVendingMachineMetricsResponseDTO {
  salesByMachine: SalesVolumeByMachineDTO[];
  productMix: ProductMixPerformanceDTO[];
  hardwareHealth: HardwareHealthDTO[];
  averageTicketTrend: AverageTicketTrendDTO[];
  
  /**
   * Summary statistics
   */
  summary: {
    totalMachines: number;
    totalSales: number;
    totalRevenue: number;
    averageTicket: number;
    healthyMachines: number;
    warningMachines: number;
    criticalMachines: number;
  };
}
