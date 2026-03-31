import { Injectable, Inject } from '@nestjs/common';
import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IChartConfigRepository } from '../../domain/ports/chart-config-repository.interface';
import { ChartConfig } from '../../domain/entities/chart-config';
import { ChartType } from '../../domain/value-objects/chart-type';
import {
  CreateChartRequestDTO,
  ChartConfigResponseDTO,
} from '../dtos/chart-config.dto';

@Injectable()
export class CreateChartUseCase
  implements IUseCase<CreateChartRequestDTO, ChartConfigResponseDTO>
{
  constructor(
    @Inject('IChartConfigRepository')
    private readonly chartConfigRepo: IChartConfigRepository,
  ) {}

  async execute(
    request: CreateChartRequestDTO,
  ): Promise<ChartConfigResponseDTO> {
    const chartTypeResult = ChartType.create(request.chartType);
    if (chartTypeResult.isFailure) {
      throw new Error(chartTypeResult.error);
    }

    const chartType = chartTypeResult.getValue();

    const chartResult = ChartConfig.create({
      dashboardId: request.dashboardId,
      companyId: request.companyId,
      name: request.name,
      chartType,
      dataSource: request.dataSource,
      visualConfig: request.visualConfig,
      position: request.position ?? { x: 0, y: 0, width: 6, height: 4 },
      displayOrder: request.displayOrder ?? 0,
    });

    if (chartResult.isFailure) {
      throw new Error(chartResult.error);
    }

    const chart = chartResult.getValue();
    await this.chartConfigRepo.save(chart);

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
