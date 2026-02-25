import { api } from './api';

// ===== Types =====

export interface DataSourceConfig {
  mode: 'STATIC' | 'DYNAMIC';
  datasetIds: string[];
  query?: {
    datasetId: string;
    select: {
      column: string;
      aggregate?: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';
      alias?: string;
    }[];
    where?: {
      column: string;
      operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN';
      value: any;
    }[];
    groupBy?: string[];
    orderBy?: { column: string; direction: 'ASC' | 'DESC' }[];
    limit?: number;
  };
  staticData?: {
    columns: string[];
    rows: Record<string, any>[];
  };
}

export interface VisualConfig {
  xAxis?: string;
  yAxis?: string[];
  colorBy?: string;
  title?: string;
  subtitle?: string;
  colors?: string[];
  legend?: boolean;
}

export interface GridPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ChartType =
  | 'BAR'
  | 'LINE'
  | 'PIE'
  | 'AREA'
  | 'KPI'
  | 'TABLE'
  | 'STATUS'
  | 'SCATTER'
  | 'HEATMAP'
  | 'GAUGE';

export interface ChartConfig {
  id: string;
  dashboardId: string;
  companyId: string;
  name: string;
  chartType: ChartType;
  dataSource: DataSourceConfig;
  visualConfig: VisualConfig;
  position: GridPosition;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChartDataResponse {
  success: boolean;
  chartConfig: ChartConfig;
  data: {
    columns: string[];
    rows: Record<string, any>[];
    totalRows: number;
  };
}

// ===== Service =====

export const chartService = {
  create: async (data: {
    dashboardId: string;
    companyId: string;
    name: string;
    chartType: string;
    dataSource: DataSourceConfig;
    visualConfig: VisualConfig;
    position?: GridPosition;
    displayOrder?: number;
  }): Promise<{ success: boolean; chart: ChartConfig }> => {
    const response = await api.post('/analytics/charts', data);
    return response.data;
  },

  get: async (id: string, companyId: string): Promise<{ success: boolean; chart: ChartConfig }> => {
    const response = await api.get(`/analytics/charts/${id}`, {
      params: { companyId },
    });
    return response.data;
  },

  update: async (
    id: string,
    data: {
      companyId: string;
      name?: string;
      chartType?: string;
      dataSource?: DataSourceConfig;
      visualConfig?: VisualConfig;
      position?: GridPosition;
      displayOrder?: number;
    },
  ): Promise<{ success: boolean; chart: ChartConfig }> => {
    const response = await api.put(`/analytics/charts/${id}`, data);
    return response.data;
  },

  delete: async (id: string, companyId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/analytics/charts/${id}`, {
      params: { companyId },
    });
    return response.data;
  },

  getData: async (id: string, companyId: string): Promise<ChartDataResponse> => {
    const response = await api.get<ChartDataResponse>(`/analytics/charts/${id}/data`, {
      params: { companyId },
    });
    return response.data;
  },
};
