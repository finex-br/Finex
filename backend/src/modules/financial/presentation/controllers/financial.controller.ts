import {
  Controller,
  Post,
  Get,
  Query,
  UseInterceptors,
  UploadedFile,
  Request,
  Headers,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '../../../authentication/presentation/http/guards/jwt-auth.guard';
import { ProcessExcelUseCase } from '../../application/use-cases/process-excel.use-case';
import { GetFinancialDataUseCase } from '../../application/use-cases/get-financial-data.use-case';
import { GetVendingMachineMetricsUseCase } from '../../application/use-cases/get-vending-machine-metrics.use-case';
import { PeriodType } from '../../application/dtos/financial.dto';
import { resolveCompanyContext } from '../../../../shared/tenant/company-context';

/**
 * FinancialController - Presentation Layer
 * 
 * Endpoints HTTP para operações financeiras.
 * Delega toda lógica para Use Cases.
 * 
 * TODO: Adicionar @UseGuards(JwtAuthGuard) após merge com branch de autenticação
 */
@Controller('financial')
@UseGuards(JwtAuthGuard)
export class FinancialController {
  constructor(
    private readonly processExcelUseCase: ProcessExcelUseCase,
    private readonly getFinancialDataUseCase: GetFinancialDataUseCase,
    private readonly getVendingMachineMetricsUseCase: GetVendingMachineMetricsUseCase,
    private readonly dataSource: DataSource,
  ) {}

  private async resolveCompanyId(
    req: any,
    requestedCompanyId?: string,
  ): Promise<{ userId: string; companyId: string }> {
    const ctx = await resolveCompanyContext(this.dataSource, req, requestedCompanyId, {
      requireCompanyIdForAdmin: true,
    });

    if (!ctx.companyId) {
      throw new HttpException('Company context not resolved', HttpStatus.BAD_REQUEST);
    }

    return { userId: ctx.userId, companyId: ctx.companyId };
  }

  /**
   * POST /financial/upload
   * 
   * Upload de arquivo Excel com transações financeiras.
   * 
   * @param file - Arquivo Excel (multipart/form-data)
   * @param req - Request com user autenticado (JWT)
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(
    @UploadedFile() file: any,
    @Request() req: any,
    @Headers('x-company-id') xCompanyId?: string,
  ) {
    try {
      // Fluxo único: upload sempre entra como documento pendente e exige aprovação do ADMIN
      // antes de entrar no dashboard (financial_data).
      throw new HttpException(
        'Este endpoint foi desativado. Use POST /financial/pending-documents/upload (fluxo com mapeamento/validação e aprovação do ADMIN).',
        HttpStatus.GONE,
      );
    } catch (error) {
      console.error('[FinancialController] Erro:', error);
      throw new HttpException(
        error.message || 'Erro ao processar Excel',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /financial/data?period=MONTH&startDate=2024-01-01&endDate=2024-12-31
   * 
   * Busca dados financeiros agregados com filtros de período:
   * - Summary (receita total, despesa total, lucro)
   * - Monthly Data (dados mensais)
   * - Category Data (dados por categoria)
   * - Trend Data (tendência ao longo do tempo)
   * 
   * Query Params:
   * - period: WEEK | MONTH | QUARTER | SEMESTER | YEAR | CUSTOM (opcional)
   * - startDate: YYYY-MM-DD (obrigatório para CUSTOM)
   * - endDate: YYYY-MM-DD (obrigatório para CUSTOM)
   * 
   * @param req - Request com user autenticado (JWT)
   * @param period - Tipo de período (opcional)
   * @param startDate - Data inicial (opcional, obrigatório para CUSTOM)
   * @param endDate - Data final (opcional, obrigatório para CUSTOM)
   */
  @Get('data')
  async getFinancialData(
    @Request() req: any,
    @Query('period') period?: PeriodType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Headers('x-company-id') xCompanyId?: string,
  ) {
    try {
      console.log('[FinancialController] GET /financial/data chamado:', { period, startDate, endDate });
      
      const { userId, companyId } = await this.resolveCompanyId(req, xCompanyId);

      console.log('[FinancialController] CompanyId:', companyId, 'UserId:', userId);

      // Validar período CUSTOM
      if (period === PeriodType.CUSTOM) {
        if (!startDate || !endDate) {
          throw new HttpException(
            'Período CUSTOM requer startDate e endDate',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Validar período válido
      if (period && !Object.values(PeriodType).includes(period)) {
        throw new HttpException(
          'Período inválido. Use: WEEK, MONTH, QUARTER, SEMESTER, YEAR ou CUSTOM',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Montar filtro de período
      const periodFilter = period
        ? {
            type: period,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
          }
        : undefined;

      // Executar Use Case
      const result = await this.getFinancialDataUseCase.execute({
        companyId,
        userId,
        periodFilter,
      });

      console.log('[FinancialController] Dados retornados:', {
        summaryProfit: result.summary.profit,
        monthlyDataCount: result.monthlyData.length,
        categoryDataCount: result.categoryData.length,
        trendDataCount: result.trendData.length,
      });

      return result;
    } catch (error) {
      console.error('[FinancialController] Erro ao buscar dados:', error);
      throw new HttpException(
        error.message || 'Erro ao buscar dados financeiros',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /financial/vending-metrics?startDate=2024-01-01&endDate=2024-12-31
   * 
   * Busca métricas operacionais de máquinas de vending (café):
   * - Sales Volume by Machine (total vendas por dispositivo)
   * - Product Mix Performance (performance por blend: qCafe1, qCafe2, qCafe3)
   * - Hardware Health Status (nivelGalao por máquina)
   * - Average Ticket Trend (ticket médio ao longo do tempo)
   * 
   * Query Params:
   * - startDate: YYYY-MM-DD (opcional)
   * - endDate: YYYY-MM-DD (opcional)
   * 
   * @param req - Request com user autenticado (JWT)
   * @param startDate - Data inicial (opcional)
   * @param endDate - Data final (opcional)
   */
  @Get('vending-metrics')
  @UseGuards(JwtAuthGuard)
  async getVendingMachineMetrics(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Headers('x-company-id') xCompanyId?: string,
  ) {
    try {
      console.log('[FinancialController] GET /financial/vending-metrics chamado:', { startDate, endDate });
      
      const { userId, companyId } = await this.resolveCompanyId(req, xCompanyId);

      console.log('[FinancialController] CompanyId:', companyId, 'UserId:', userId);

      // Converter datas de string para Date (se fornecidas)
      const parsedStartDate = startDate ? new Date(startDate as string) : undefined;
      const parsedEndDate = endDate ? new Date(endDate as string) : undefined;

      // Executar Use Case
      const result = await this.getVendingMachineMetricsUseCase.execute({
        companyId,
        userId,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      });

      console.log('[FinancialController] Métricas retornadas:', {
        totalMachines: result.summary.totalMachines,
        totalSales: result.summary.totalSales,
        healthyMachines: result.summary.healthyMachines,
        criticalMachines: result.summary.criticalMachines,
      });

      return result;
    } catch (error) {
      console.error('[FinancialController] Erro ao buscar métricas de vending:', error);
      throw new HttpException(
        error.message || 'Erro ao buscar métricas de máquinas de vending',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
