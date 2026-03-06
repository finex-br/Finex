import { Injectable, Inject } from '@nestjs/common';
import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IDashboardRepository } from '../../domain/ports/dashboard-repository.interface';
import { IChartConfigRepository } from '../../domain/ports/chart-config-repository.interface';
import { IAnalyticsEngine } from '../../domain/ports/analytics-engine.interface';
import { Dashboard } from '../../domain/entities/dashboard';
import { ChartConfig } from '../../domain/entities/chart-config';
import { ChartConfigResponseDTO } from '../dtos/chart-config.dto';
import {
  GetDashboardRequestDTO,
  DashboardWithDataResponseDTO,
} from '../dtos/dashboard.dto';

@Injectable()
export class GetDashboardUseCase
  implements IUseCase<GetDashboardRequestDTO, DashboardWithDataResponseDTO> {
  constructor(
    @Inject('IDashboardRepository')
    private readonly dashboardRepo: IDashboardRepository,
    @Inject('IChartConfigRepository')
    private readonly chartConfigRepo: IChartConfigRepository,
    @Inject('IAnalyticsEngine')
    private readonly analyticsEngine: IAnalyticsEngine,
  ) { }

  async execute(
    request: GetDashboardRequestDTO,
  ): Promise<DashboardWithDataResponseDTO> {
    const dashboard = await this.dashboardRepo.findById(request.dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard not found: ${request.dashboardId}`);
    }

    if (dashboard.companyId !== request.companyId) {
      throw new Error('Unauthorized: dashboard does not belong to this company');
    }

    const charts = await this.chartConfigRepo.findByDashboardId(
      request.dashboardId,
    );

    const chartsWithData = await Promise.all(
      charts.map(async (chart) => {
        let data: { columns: string[]; rows: Record<string, any>[]; totalRows: number };

        try {
          if (chart.dataSource.mode === 'STATIC' && chart.dataSource.staticData) {
            const staticData = chart.dataSource.staticData;
            const columns =
              staticData.length > 0 ? Object.keys(staticData[0]) : [];
            data = {
              columns,
              rows: staticData,
              totalRows: staticData.length,
            };
          } else if (chart.dataSource.query && chart.dataSource.query.select && chart.dataSource.query.select.length > 0) {
            const queryResult = await this.analyticsEngine.executeQuery(
              chart.dataSource.query,
              request.companyId,
            );
            data = {
              columns: queryResult.columns,
              rows: queryResult.rows,
              totalRows: queryResult.totalRows,
            };
          } else {
            // No query configured yet - return empty data
            data = { columns: [], rows: [], totalRows: 0 };
          }
        } catch (err) {
          console.error(`[GetDashboard] Error fetching data for chart ${chart.id.toString()}:`, err);
          data = { columns: [], rows: [], totalRows: 0 };
        }

        return {
          config: this.toChartConfigDTO(chart),
          data,
        };
      }),
    );

    return {
      ...this.toDashboardDTO(dashboard),
      charts: chartsWithData,
    };
  }

  private toDashboardDTO(dashboard: Dashboard): Omit<DashboardWithDataResponseDTO, 'charts'> {
    return {
      id: dashboard.id.toString(),
      companyId: dashboard.companyId,
      name: dashboard.name,
      description: dashboard.description,
      isDefault: dashboard.isDefault,
      embedHtml: dashboard.embedHtml,
    };
  }

  private toChartConfigDTO(chart: ChartConfig): ChartConfigResponseDTO {
    return {
      id: chart.id.toString(),
      dashboardId: chart.dashboardId,
      companyId: chart.companyId,
      name: chart.name,
      chartType: chart.chartType.value,
      dataSource: chart.dataSource,
      visualConfig: chart.visualConfig,
      position: chart.position,
      displayOrder: chart.displayOrder,
      createdAt: chart.createdAt!,
      updatedAt: chart.updatedAt!,
    };
  }
}
