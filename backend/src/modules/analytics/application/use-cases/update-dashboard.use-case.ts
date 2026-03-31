import { Injectable, Inject } from '@nestjs/common';
import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IDashboardRepository } from '../../domain/ports/dashboard-repository.interface';
import {
  UpdateDashboardRequestDTO,
  DashboardResponseDTO,
} from '../dtos/dashboard.dto';
import { processEmbedHtml } from '../helpers/sanitize-html';

@Injectable()
export class UpdateDashboardUseCase
  implements IUseCase<UpdateDashboardRequestDTO, DashboardResponseDTO> {
  constructor(
    @Inject('IDashboardRepository')
    private readonly dashboardRepo: IDashboardRepository,
  ) { }

  async execute(
    request: UpdateDashboardRequestDTO,
  ): Promise<DashboardResponseDTO> {
    const dashboard = await this.dashboardRepo.findById(request.dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard not found: ${request.dashboardId}`);
    }

    if (dashboard.companyId !== request.companyId) {
      throw new Error('Unauthorized: dashboard does not belong to this company');
    }

    const processedEmbedHtml = request.embedHtml !== undefined
      ? (request.embedHtml ? processEmbedHtml(request.embedHtml) : null)
      : undefined;

    dashboard.update({
      name: request.name,
      description: request.description,
      isDefault: request.isDefault,
      embedHtml: processedEmbedHtml === null ? null : processedEmbedHtml || undefined,
      metabaseDashboardId: request.metabaseDashboardId !== undefined
        ? (request.metabaseDashboardId ?? null)
        : undefined,
    });

    await this.dashboardRepo.update(dashboard);

    return {
      id: dashboard.id.toString(),
      companyId: dashboard.companyId,
      name: dashboard.name,
      description: dashboard.description,
      isDefault: dashboard.isDefault,
      embedHtml: dashboard.embedHtml,
      metabaseDashboardId: dashboard.metabaseDashboardId,
      createdBy: dashboard.createdBy,
      createdAt: dashboard.createdAt!,
      updatedAt: dashboard.updatedAt!,
    };
  }
}
