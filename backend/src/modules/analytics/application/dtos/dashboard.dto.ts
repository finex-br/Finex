import { ChartConfigResponseDTO } from './chart-config.dto';

// ===== Create Dashboard =====

export interface CreateDashboardRequestDTO {
  companyId: string;
  userId: string;
  name: string;
  description?: string;
  isDefault?: boolean;
}

export interface DashboardResponseDTO {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Update Dashboard =====

export interface UpdateDashboardRequestDTO {
  dashboardId: string;
  companyId: string;
  name?: string;
  description?: string;
  isDefault?: boolean;
}

// ===== Get Dashboard with Charts =====

export interface GetDashboardRequestDTO {
  dashboardId: string;
  companyId: string;
}

export interface DashboardWithChartsResponseDTO {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  createdBy: string;
  charts: ChartConfigResponseDTO[];
  createdAt: Date;
  updatedAt: Date;
}

// ===== Get Dashboard with Charts and Data =====

export interface DashboardWithDataResponseDTO {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  charts: {
    config: ChartConfigResponseDTO;
    data: {
      columns: string[];
      rows: Record<string, any>[];
      totalRows: number;
    };
  }[];
}
