import { api } from './api';
import { ChartConfig } from './chartService';

// ===== Types =====

export interface Dashboard {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  embedHtml?: string;
  metabaseDashboardId?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWithCharts extends Dashboard {
  charts: ChartConfig[];
}

export interface DashboardWithData {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  embedHtml?: string;
  metabaseDashboardId?: number;
  charts: {
    config: ChartConfig;
    data: {
      columns: string[];
      rows: Record<string, any>[];
      totalRows: number;
    };
  }[];
}

// ===== Service =====

export const dashboardService = {
  create: async (data: {
    companyId: string;
    name: string;
    description?: string;
    isDefault?: boolean;
    embedHtml?: string;
    metabaseDashboardId?: number;
  }): Promise<{ success: boolean; dashboard: Dashboard }> => {
    const response = await api.post('/analytics/dashboards', data);
    return response.data;
  },

  list: async (companyId: string): Promise<{ success: boolean; dashboards: Dashboard[] }> => {
    const response = await api.get('/analytics/dashboards', {
      params: { companyId },
    });
    return response.data;
  },

  get: async (id: string, companyId: string): Promise<{ success: boolean } & DashboardWithData> => {
    const response = await api.get(`/analytics/dashboards/${id}`, {
      params: { companyId },
    });
    return response.data;
  },

  update: async (
    id: string,
    data: {
      companyId: string;
      name?: string;
      description?: string;
      isDefault?: boolean;
      embedHtml?: string;
      metabaseDashboardId?: number | null;
    },
  ): Promise<{ success: boolean; dashboard: Dashboard }> => {
    const response = await api.put(`/analytics/dashboards/${id}`, data);
    return response.data;
  },

  getMetabaseToken: async (
    dashboardId: string,
    companyId: string,
  ): Promise<{ token: string; siteUrl: string }> => {
    const response = await api.get(
      `/analytics/dashboards/${dashboardId}/metabase-token`,
      { params: { companyId } },
    );
    return response.data;
  },

  delete: async (id: string, companyId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/analytics/dashboards/${id}`, {
      params: { companyId },
    });
    return response.data;
  },
};
