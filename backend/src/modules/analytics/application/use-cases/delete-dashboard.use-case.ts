import { Injectable, Inject } from '@nestjs/common';
import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IDashboardRepository } from '../../domain/ports/dashboard-repository.interface';

interface DeleteDashboardRequest {
  dashboardId: string;
  companyId: string;
}

interface DeleteDashboardResponse {
  success: boolean;
}

@Injectable()
export class DeleteDashboardUseCase
  implements IUseCase<DeleteDashboardRequest, DeleteDashboardResponse>
{
  constructor(
    @Inject('IDashboardRepository')
    private readonly dashboardRepo: IDashboardRepository,
  ) {}

  async execute(
    request: DeleteDashboardRequest,
  ): Promise<DeleteDashboardResponse> {
    const dashboard = await this.dashboardRepo.findById(request.dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard not found: ${request.dashboardId}`);
    }

    if (dashboard.companyId !== request.companyId) {
      throw new Error('Unauthorized: dashboard does not belong to this company');
    }

    await this.dashboardRepo.delete(request.dashboardId);

    return { success: true };
  }
}
