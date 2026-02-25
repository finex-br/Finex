import { Injectable, Inject } from '@nestjs/common';
import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IChartConfigRepository } from '../../domain/ports/chart-config-repository.interface';
import { ChartType } from '../../domain/value-objects/chart-type';
import {
  UpdateChartRequestDTO,
  ChartConfigResponseDTO,
} from '../dtos/chart-config.dto';

@Injectable()
export class UpdateChartUseCase
  implements IUseCase<UpdateChartRequestDTO, ChartConfigResponseDTO>
{
  constructor(
    @Inject('IChartConfigRepository')
    private readonly chartConfigRepo: IChartConfigRepository,
  ) {}

  async execute(
    request: UpdateChartRequestDTO,
  ): Promise<ChartConfigResponseDTO> {
    const chart = await this.chartConfigRepo.findById(request.chartId);
    if (!chart) {
      throw new Error(`Chart config not found: ${request.chartId}`);
    }

    if (chart.companyId !== request.companyId) {
      throw new Error('Unauthorized: chart does not belong to this company');
    }

    let chartType: ChartType | undefined;
    if (request.chartType) {
      const chartTypeResult = ChartType.create(request.chartType);
      if (chartTypeResult.isFailure) {
        throw new Error(chartTypeResult.error);
      }
      chartType = chartTypeResult.getValue();
    }

    chart.update({
      name: request.name,
      chartType,
      dataSource: request.dataSource,
      visualConfig: request.visualConfig,
      position: request.position,
      displayOrder: request.displayOrder,
    });

    await this.chartConfigRepo.update(chart);

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
