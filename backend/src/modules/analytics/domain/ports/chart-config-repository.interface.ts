import { ChartConfig } from '../entities/chart-config';

export interface IChartConfigRepository {
  save(chart: ChartConfig): Promise<void>;
  findById(id: string): Promise<ChartConfig | null>;
  findByDashboardId(dashboardId: string): Promise<ChartConfig[]>;
  update(chart: ChartConfig): Promise<void>;
  delete(id: string): Promise<void>;
}
