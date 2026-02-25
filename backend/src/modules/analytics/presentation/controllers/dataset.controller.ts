import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  Request,
  HttpException,
  HttpStatus,
  UseGuards,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '../../../authentication/presentation/http/guards/jwt-auth.guard';
import { resolveCompanyContext } from '../../../../shared/tenant/company-context';
import { UploadDatasetUseCase } from '../../application/use-cases/upload-dataset.use-case';
import { GetDatasetsUseCase } from '../../application/use-cases/get-datasets.use-case';
import { GetDatasetPreviewUseCase } from '../../application/use-cases/get-dataset-preview.use-case';
import { ReuploadDatasetUseCase } from '../../application/use-cases/reupload-dataset.use-case';
import { DeleteDatasetUseCase } from '../../application/use-cases/delete-dataset.use-case';
import { DownloadDatasetUseCase } from '../../application/use-cases/download-dataset.use-case';
import { ExecuteQueryUseCase } from '../../application/use-cases/execute-query.use-case';

@Controller('analytics/datasets')
@UseGuards(JwtAuthGuard)
export class DatasetController {
  constructor(
    private readonly uploadDatasetUseCase: UploadDatasetUseCase,
    private readonly getDatasetsUseCase: GetDatasetsUseCase,
    private readonly getDatasetPreviewUseCase: GetDatasetPreviewUseCase,
    private readonly reuploadDatasetUseCase: ReuploadDatasetUseCase,
    private readonly deleteDatasetUseCase: DeleteDatasetUseCase,
    private readonly downloadDatasetUseCase: DownloadDatasetUseCase,
    private readonly executeQueryUseCase: ExecuteQueryUseCase,
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

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: any,
    @Body('name') name: string,
    @Body('companyId') companyId: string,
    @Request() req: any,
  ) {
    try {
      const ctx = await this.resolveAdmin(req, companyId);

      if (!file) {
        throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
      }

      const result = await this.uploadDatasetUseCase.execute({
        companyId: ctx.companyId!,
        userId: ctx.userId,
        name: name || file.originalname,
        fileBuffer: file.buffer,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
      });

      return { success: true, ...result };
    } catch (error: any) {
      console.error('[DatasetController] Upload error:', error.message);
      throw new HttpException(
        error.message || 'Upload failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async list(@Query('companyId') companyId: string, @Request() req: any) {
    try {
      const ctx = await this.resolveAdmin(req, companyId);
      const datasets = await this.getDatasetsUseCase.execute({
        companyId: ctx.companyId!,
      });
      return { success: true, datasets };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to list datasets',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async preview(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Query('limit') limit: string,
    @Query('offset') offset: string,
    @Request() req: any,
  ) {
    try {
      const ctx = await this.resolveAdmin(req, companyId);
      const result = await this.getDatasetPreviewUseCase.execute({
        datasetId: id,
        companyId: ctx.companyId!,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      });
      return { success: true, ...result };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to get preview',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Request() req: any,
    @Res() res: Response,
  ) {
    try {
      const ctx = await this.resolveAdmin(req, companyId);
      const result = await this.downloadDatasetUseCase.execute({
        datasetId: id,
        companyId: ctx.companyId!,
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${result.fileName}"`,
      );

      // Build CSV
      const headers = result.columns.join(',');
      const csvRows = result.rows.map((row) =>
        result.columns.map((col) => {
          const val = String(row[col] ?? '');
          return val.includes(',') || val.includes('"')
            ? `"${val.replace(/"/g, '""')}"`
            : val;
        }).join(','),
      );
      res.send([headers, ...csvRows].join('\n'));
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to download',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/reupload')
  @UseInterceptors(FileInterceptor('file'))
  async reupload(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Body('companyId') companyId: string,
    @Request() req: any,
  ) {
    try {
      const ctx = await this.resolveAdmin(req, companyId);

      if (!file) {
        throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
      }

      const result = await this.reuploadDatasetUseCase.execute({
        datasetId: id,
        companyId: ctx.companyId!,
        userId: ctx.userId,
        fileBuffer: file.buffer,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
      });

      return { success: true, ...result };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Reupload failed',
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
      await this.deleteDatasetUseCase.execute({
        datasetId: id,
        companyId: ctx.companyId!,
      });
      return { success: true };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Delete failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('query')
  async query(@Body() body: any, @Request() req: any) {
    try {
      const ctx = await this.resolveAdmin(req, body.companyId);
      const result = await this.executeQueryUseCase.execute({
        companyId: ctx.companyId!,
        datasetId: body.datasetId,
        select: body.select,
        where: body.where,
        groupBy: body.groupBy,
        orderBy: body.orderBy,
        limit: body.limit,
      });
      return { success: true, ...result };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Query failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
