import { Injectable, Inject } from '@nestjs/common';
import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IDashboardRepository } from '../../domain/ports/dashboard-repository.interface';
import { Dashboard } from '../../domain/entities/dashboard';
import {
  CreateDashboardRequestDTO,
  DashboardResponseDTO,
} from '../dtos/dashboard.dto';
import { processEmbedHtml } from '../helpers/sanitize-html';

@Injectable()
export class CreateDashboardUseCase
  implements IUseCase<CreateDashboardRequestDTO, DashboardResponseDTO> {
  constructor(
    @Inject('IDashboardRepository')
    private readonly dashboardRepo: IDashboardRepository,
  ) { }

  async execute(
    request: CreateDashboardRequestDTO,
  ): Promise<DashboardResponseDTO> {
    const processedEmbedHtml = request.embedHtml
      ? processEmbedHtml(request.embedHtml)
      : undefined;

    const dashboardResult = Dashboard.create({
      companyId: request.companyId,
      name: request.name,
      description: request.description,
      isDefault: request.isDefault ?? false,
      embedHtml: processedEmbedHtml || undefined,
      metabaseDashboardId: request.metabaseDashboardId,
      createdBy: request.userId,
    });

    if (dashboardResult.isFailure) {
      throw new Error(dashboardResult.error);
    }

    const dashboard = dashboardResult.getValue();
    await this.dashboardRepo.save(dashboard);

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
