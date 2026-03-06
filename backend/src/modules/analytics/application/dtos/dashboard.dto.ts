import { ChartConfigResponseDTO } from './chart-config.dto';

// ===== Create Dashboard =====

export interface CreateDashboardRequestDTO {
  companyId: string;
  userId: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  embedHtml?: string;
}

export interface DashboardResponseDTO {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  embedHtml?: string;
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
  embedHtml?: string;
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
  embedHtml?: string;
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
  embedHtml?: string;
  charts: {
    config: ChartConfigResponseDTO;
    data: {
      columns: string[];
      rows: Record<string, any>[];
      totalRows: number;
    };
  }[];
}
