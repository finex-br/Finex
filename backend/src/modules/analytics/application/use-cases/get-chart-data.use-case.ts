import { Injectable, Inject } from '@nestjs/common';
import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IChartConfigRepository } from '../../domain/ports/chart-config-repository.interface';
import { IAnalyticsEngine } from '../../domain/ports/analytics-engine.interface';
import { ChartConfig } from '../../domain/entities/chart-config';
import {
  GetChartDataRequestDTO,
  GetChartDataResponseDTO,
  ChartConfigResponseDTO,
} from '../dtos/chart-config.dto';

@Injectable()
export class GetChartDataUseCase
  implements IUseCase<GetChartDataRequestDTO, GetChartDataResponseDTO>
{
  constructor(
    @Inject('IChartConfigRepository')
    private readonly chartConfigRepo: IChartConfigRepository,
    @Inject('IAnalyticsEngine')
    private readonly analyticsEngine: IAnalyticsEngine,
  ) {}

  async execute(
    request: GetChartDataRequestDTO,
  ): Promise<GetChartDataResponseDTO> {
    const chart = await this.chartConfigRepo.findById(request.chartId);
    if (!chart) {
      throw new Error(`Chart config not found: ${request.chartId}`);
    }

    if (chart.companyId !== request.companyId) {
      throw new Error('Unauthorized: chart does not belong to this company');
    }

    let data: { columns: string[]; rows: Record<string, any>[]; totalRows: number };

    try {
      if (chart.dataSource.mode === 'STATIC' && chart.dataSource.staticData) {
        const staticData = chart.dataSource.staticData;
        const columns = staticData.length > 0 ? Object.keys(staticData[0]) : [];
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
        data = { columns: [], rows: [], totalRows: 0 };
      }
    } catch (err) {
      console.error(`[GetChartData] Error fetching data for chart ${request.chartId}:`, err);
      data = { columns: [], rows: [], totalRows: 0 };
    }

    return {
      chartConfig: this.toChartConfigDTO(chart),
      data,
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
