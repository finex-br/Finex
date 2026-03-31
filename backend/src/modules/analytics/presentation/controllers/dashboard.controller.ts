import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Request,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '../../../authentication/presentation/http/guards/jwt-auth.guard';
import { resolveCompanyContext } from '../../../../shared/tenant/company-context';
import { CreateDashboardUseCase } from '../../application/use-cases/create-dashboard.use-case';
import { UpdateDashboardUseCase } from '../../application/use-cases/update-dashboard.use-case';
import { DeleteDashboardUseCase } from '../../application/use-cases/delete-dashboard.use-case';
import { GetDashboardUseCase } from '../../application/use-cases/get-dashboard.use-case';
import { GetDatasetsUseCase } from '../../application/use-cases/get-datasets.use-case';
import { GenerateMetabaseEmbedTokenUseCase } from '../../application/use-cases/generate-metabase-embed-token.use-case';

@Controller('analytics/dashboards')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly createDashboardUseCase: CreateDashboardUseCase,
    private readonly updateDashboardUseCase: UpdateDashboardUseCase,
    private readonly deleteDashboardUseCase: DeleteDashboardUseCase,
    private readonly getDashboardUseCase: GetDashboardUseCase,
    private readonly generateMetabaseEmbedTokenUseCase: GenerateMetabaseEmbedTokenUseCase,
    private readonly dataSource: DataSource,
  ) { }

  private async resolveAdmin(req: any, companyIdOverride?: string) {
    const ctx = await resolveCompanyContext(this.dataSource, req, companyIdOverride, {
      requireCompanyIdForAdmin: true,
    });
    if (!ctx.isSystemAdmin) {
      throw new HttpException('Admin access required', HttpStatus.FORBIDDEN);
    }
    return ctx;
  }

  @Post()
  async create(@Body() body: any, @Request() req: any) {
    try {
      const ctx = await this.resolveAdmin(req, body.companyId);
      const result = await this.createDashboardUseCase.execute({
        companyId: ctx.companyId!,
        userId: ctx.userId,
        name: body.name,
        description: body.description,
        isDefault: body.isDefault,
        embedHtml: body.embedHtml,
        metabaseDashboardId: body.metabaseDashboardId
          ? Number(body.metabaseDashboardId)
          : undefined,
      });
      return { success: true, dashboard: result };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to create dashboard',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async list(@Query('companyId') companyId: string, @Request() req: any) {
    try {
      const ctx = await resolveCompanyContext(this.dataSource, req, companyId, {
        requireCompanyIdForAdmin: true,
      });

      // Fetch all dashboards for the company
      const dashboards = await this.dataSource.query(
        `SELECT id, company_id as "companyId", name, description,
                is_default as "isDefault", created_by as "createdBy",
                embed_html as "embedHtml",
                metabase_dashboard_id as "metabaseDashboardId",
                created_at as "createdAt", updated_at as "updatedAt"
         FROM dashboards
         WHERE company_id = $1
         ORDER BY created_at DESC`,
        [ctx.companyId],
      );

      return { success: true, dashboards };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to list dashboards',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async get(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Request() req: any,
  ) {
    try {
      const ctx = await resolveCompanyContext(this.dataSource, req, companyId, {
        requireCompanyIdForAdmin: true,
      });
      const result = await this.getDashboardUseCase.execute({
        dashboardId: id,
        companyId: ctx.companyId!,
      });
      return { success: true, ...result };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to get dashboard',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    try {
      const ctx = await this.resolveAdmin(req, body.companyId);
      const result = await this.updateDashboardUseCase.execute({
        dashboardId: id,
        companyId: ctx.companyId!,
        name: body.name,
        description: body.description,
        isDefault: body.isDefault,
        embedHtml: body.embedHtml,
        metabaseDashboardId: body.metabaseDashboardId !== undefined
          ? (body.metabaseDashboardId ? Number(body.metabaseDashboardId) : null)
          : undefined,
      });
      return { success: true, dashboard: result };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to update dashboard',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/metabase-token')
  async getMetabaseToken(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Request() req: any,
  ) {
    try {
      const ctx = await resolveCompanyContext(this.dataSource, req, companyId, {
        requireCompanyIdForAdmin: true,
      });
      const result = await this.generateMetabaseEmbedTokenUseCase.execute({
        dashboardId: id,
        companyId: ctx.companyId!,
      });
      return { success: true, ...result };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to generate Metabase token',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Request() req: any,
  ) {
    try {
      const ctx = await this.resolveAdmin(req, companyId);
      await this.deleteDashboardUseCase.execute({
        dashboardId: id,
        companyId: ctx.companyId!,
      });
      return { success: true };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to delete dashboard',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
