import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IDashboardRepository } from '../../domain/ports/dashboard-repository.interface';
import { MetabaseEmbedTokenResponseDTO } from '../dtos/dashboard.dto';
import { EnvService } from '../../../../shared/infra/env/env.service';

interface GenerateMetabaseEmbedTokenRequest {
  dashboardId: string;
  companyId: string;
}

@Injectable()
export class GenerateMetabaseEmbedTokenUseCase
  implements IUseCase<GenerateMetabaseEmbedTokenRequest, MetabaseEmbedTokenResponseDTO>
{
  constructor(
    @Inject('IDashboardRepository')
    private readonly dashboardRepo: IDashboardRepository,
    private readonly jwtService: JwtService,
    private readonly envService: EnvService,
  ) {}

  async execute(
    request: GenerateMetabaseEmbedTokenRequest,
  ): Promise<MetabaseEmbedTokenResponseDTO> {
    const dashboard = await this.dashboardRepo.findById(request.dashboardId);

    if (!dashboard) {
      throw new Error(`Dashboard not found: ${request.dashboardId}`);
    }

    if (dashboard.companyId !== request.companyId) {
      throw new Error('Unauthorized: dashboard does not belong to this company');
    }

    if (!dashboard.metabaseDashboardId) {
      throw new Error('This dashboard does not have a Metabase dashboard configured');
    }

    const secretKey = this.envService.metabaseSecretKey;
    const siteUrl = this.envService.metabaseSiteUrl;

    if (!secretKey) {
      throw new Error('METABASE_SECRET_KEY is not configured');
    }

    const payload = {
      resource: { dashboard: dashboard.metabaseDashboardId },
      params: {},
    };

    const token = this.jwtService.sign(payload, {
      secret: secretKey,
      algorithm: 'HS256',
      expiresIn: 3600,
    });

    return { token, siteUrl };
  }
}
