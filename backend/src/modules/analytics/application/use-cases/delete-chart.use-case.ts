import { Injectable, Inject } from '@nestjs/common';
import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IChartConfigRepository } from '../../domain/ports/chart-config-repository.interface';

interface DeleteChartRequest {
  chartId: string;
  companyId: string;
}

interface DeleteChartResponse {
  success: boolean;
}

@Injectable()
export class DeleteChartUseCase
  implements IUseCase<DeleteChartRequest, DeleteChartResponse>
{
  constructor(
    @Inject('IChartConfigRepository')
    private readonly chartConfigRepo: IChartConfigRepository,
  ) {}

  async execute(request: DeleteChartRequest): Promise<DeleteChartResponse> {
    const chart = await this.chartConfigRepo.findById(request.chartId);
    if (!chart) {
      throw new Error(`Chart config not found: ${request.chartId}`);
    }

    if (chart.companyId !== request.companyId) {
      throw new Error('Unauthorized: chart does not belong to this company');
    }

    await this.chartConfigRepo.delete(request.chartId);

    return { success: true };
  }
}
