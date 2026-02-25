import { DataSourceConfig } from '../../domain/value-objects/data-source-config';
import { VisualConfig } from '../../domain/value-objects/visual-config';
import { GridPosition } from '../../domain/value-objects/grid-position';

// ===== Create Chart =====

export interface CreateChartRequestDTO {
  dashboardId: string;
  companyId: string;
  name: string;
  chartType: string;
  dataSource: DataSourceConfig;
  visualConfig: VisualConfig;
  position?: GridPosition;
  displayOrder?: number;
}

export interface ChartConfigResponseDTO {
  id: string;
  dashboardId: string;
  companyId: string;
  name: string;
  chartType: string;
  dataSource: DataSourceConfig;
  visualConfig: VisualConfig;
  position: GridPosition;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Update Chart =====

export interface UpdateChartRequestDTO {
  chartId: string;
  companyId: string;
  name?: string;
  chartType?: string;
  dataSource?: DataSourceConfig;
  visualConfig?: VisualConfig;
  position?: GridPosition;
  displayOrder?: number;
}

// ===== Get Chart Data =====

export interface GetChartDataRequestDTO {
  chartId: string;
  companyId: string;
}

export interface GetChartDataResponseDTO {
  chartConfig: ChartConfigResponseDTO;
  data: {
    columns: string[];
    rows: Record<string, any>[];
    totalRows: number;
  };
}
