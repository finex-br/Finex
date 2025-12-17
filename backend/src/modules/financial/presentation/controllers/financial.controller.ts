import {
  Controller,
  Post,
  Get,
  Query,
  // UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
// import { JwtAuthGuard } from '../../../authentication/presentation/guards/jwt-auth.guard';
import { ProcessExcelUseCase } from '../../application/use-cases/process-excel.use-case';
import { GetFinancialDataUseCase } from '../../application/use-cases/get-financial-data.use-case';
import { PeriodType } from '../../application/dtos/financial.dto';

/**
 * FinancialController - Presentation Layer
 * 
 * Endpoints HTTP para operações financeiras.
 * Delega toda lógica para Use Cases.
 */
@Controller('financial')
// @UseGuards(JwtAuthGuard) // TODO: Descomentar quando implementar autenticação
export class FinancialController {
  constructor(
    private readonly processExcelUseCase: ProcessExcelUseCase,
    private readonly getFinancialDataUseCase: GetFinancialDataUseCase,
  ) {}

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
  ) {
    try {
      if (!file) {
        throw new HttpException('Arquivo não enviado', HttpStatus.BAD_REQUEST);
      }

      // Validar tipo de arquivo
      const allowedMimeTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new HttpException(
          'Tipo de arquivo inválido. Use .xlsx ou .xls',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Pegar companyId do JWT, body ou usar default para testes
      const companyId = req.user?.currentCompanyId || req.body?.companyId || 'default-company';
      const userId = req.user?.id || req.body?.userId || 'default-user';

      // Executar Use Case
      const result = await this.processExcelUseCase.execute({
        companyId,
        userId,
        fileBuffer: file.buffer,
        fileName: file.originalname,
      });

      return result;
    } catch (error) {
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
  ) {
    try {
      const companyId = req.user?.currentCompanyId || req.query?.companyId || 'default-company';
      const userId = req.user?.id || req.query?.userId || 'default-user';

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

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao buscar dados financeiros',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
