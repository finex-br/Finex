import {
  Controller,
  Post,
  Get,
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
    @UploadedFile() file: Express.Multer.File,
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
   * GET /financial/data
   * 
   * Busca dados financeiros agregados (summary + monthly data).
   * 
   * @param req - Request com user autenticado (JWT)
   */
  @Get('data')
  async getFinancialData(@Request() req: any) {
    try {
      const companyId = req.user?.currentCompanyId || req.query?.companyId || 'default-company';
      const userId = req.user?.id || req.query?.userId || 'default-user';

      // Executar Use Case
      const result = await this.getFinancialDataUseCase.execute({
        companyId,
        userId,
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
