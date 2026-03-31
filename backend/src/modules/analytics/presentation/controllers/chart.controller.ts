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
import { CreateChartUseCase } from '../../application/use-cases/create-chart.use-case';
import { UpdateChartUseCase } from '../../application/use-cases/update-chart.use-case';
import { DeleteChartUseCase } from '../../application/use-cases/delete-chart.use-case';
import { GetChartDataUseCase } from '../../application/use-cases/get-chart-data.use-case';

@Controller('analytics/charts')
@UseGuards(JwtAuthGuard)
export class ChartController {
  constructor(
    private readonly createChartUseCase: CreateChartUseCase,
    private readonly updateChartUseCase: UpdateChartUseCase,
    private readonly deleteChartUseCase: DeleteChartUseCase,
    private readonly getChartDataUseCase: GetChartDataUseCase,
    private readonly dataSource: DataSource,
  ) {}

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
      const result = await this.createChartUseCase.execute({
        dashboardId: body.dashboardId,
        companyId: ctx.companyId!,
        name: body.name,
        chartType: body.chartType,
        dataSource: body.dataSource,
        visualConfig: body.visualConfig,
        position: body.position,
        displayOrder: body.displayOrder,
      });
      return { success: true, chart: result };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to create chart',
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
      const result = await this.getChartDataUseCase.execute({
        chartId: id,
        companyId: ctx.companyId!,
      });
      return { success: true, ...result };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to get chart',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/data')
  async getData(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Request() req: any,
  ) {
    try {
      const ctx = await resolveCompanyContext(this.dataSource, req, companyId, {
        requireCompanyIdForAdmin: true,
      });
      const result = await this.getChartDataUseCase.execute({
        chartId: id,
        companyId: ctx.companyId!,
      });
      return { success: true, ...result };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to get chart data',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    try {
      const ctx = await this.resolveAdmin(req, body.companyId);
      const result = await this.updateChartUseCase.execute({
        chartId: id,
        companyId: ctx.companyId!,
        name: body.name,
        chartType: body.chartType,
        dataSource: body.dataSource,
        visualConfig: body.visualConfig,
        position: body.position,
        displayOrder: body.displayOrder,
      });
      return { success: true, chart: result };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to update chart',
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
      await this.deleteChartUseCase.execute({
        chartId: id,
        companyId: ctx.companyId!,
      });
      return { success: true };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to delete chart',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
