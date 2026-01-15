import {
  Controller,
  Inject,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  Request,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '../../../authentication/presentation/http/guards/jwt-auth.guard';
import { UploadRawDocumentUseCase } from '../../application/use-cases/upload-raw-document.use-case';
import { MapDocumentColumnsUseCase } from '../../application/use-cases/map-document-columns.use-case';
import { ValidateDocumentUseCase } from '../../application/use-cases/validate-document.use-case';
import { ApproveDocumentUseCase } from '../../application/use-cases/approve-document.use-case';
import { GetPendingDocumentsUseCase } from '../../application/use-cases/get-pending-documents.use-case';
import { IPendingDocumentRepository } from '../../domain/ports/pending-document-repository.interface';

/**
 * PendingDocumentController - Presentation Layer
 * 
 * Endpoints para sistema de upload flexível com mapeamento e validação.
 * Requer autenticação JWT em todos os endpoints.
 */
@Controller('financial/pending-documents')
@UseGuards(JwtAuthGuard)
export class PendingDocumentController {
  constructor(
    private readonly uploadRawDocumentUseCase: UploadRawDocumentUseCase,
    private readonly mapDocumentColumnsUseCase: MapDocumentColumnsUseCase,
    private readonly validateDocumentUseCase: ValidateDocumentUseCase,
    private readonly approveDocumentUseCase: ApproveDocumentUseCase,
    private readonly getPendingDocumentsUseCase: GetPendingDocumentsUseCase,
    private readonly dataSource: DataSource,
    @Inject('IPendingDocumentRepository')
    private readonly pendingDocumentRepository: IPendingDocumentRepository,
  ) {}

  /**
   * Busca company_id do usuário na tabela company_members
   */
  private async getCompanyIdForUser(userId: string): Promise<string> {
    const result = await this.dataSource.query(
      'SELECT company_id FROM company_members WHERE user_id = $1 AND is_active = true LIMIT 1',
      [userId]
    );

    if (!result || result.length === 0) {
      throw new HttpException(
        'User is not associated with any company',
        HttpStatus.FORBIDDEN,
      );
    }

    return result[0].company_id;
  }

  /**
   * POST /financial/pending-documents/upload
   * 
   * Upload de documento sem processamento completo.
   * Apenas extrai estrutura e sugere mapeamento.
   * 
   * @param file - Arquivo Excel (multipart/form-data)
   * @param req - Request com user autenticado (JWT)
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadRawDocument(
    @UploadedFile() file: any,
    @Request() req: any,
  ) {
    try {
      console.log('[PendingDocumentController] Upload recebido:', {
        hasFile: !!file,
        filename: file?.originalname,
        mimetype: file?.mimetype,
        size: file?.size,
      });

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

      // Extrai userId do JWT
      const userId = req.user?.sub || req.user?.userId;
      
      if (!userId) {
        throw new HttpException('User ID not found in token', HttpStatus.UNAUTHORIZED);
      }
      
      // Busca company_id do usuário
      const companyId = await this.getCompanyIdForUser(userId);

      console.log('[PendingDocumentController] Processando com:', { companyId, userId });

      // Executar Use Case
      const result = await this.uploadRawDocumentUseCase.execute({
        companyId,
        userId,
        fileBuffer: file.buffer,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
      });

      console.log('[PendingDocumentController] Resultado:', result);

      return result;
    } catch (error) {
      console.error('[PendingDocumentController] Erro:', error);
      throw new HttpException(
        error.message || 'Erro ao processar documento',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /financial/pending-documents
   * 
   * Lista documentos pendentes da empresa.
   * 
   * Query Params:
   * - status: UPLOADED | MAPPED | VALIDATED | APPROVED | REJECTED (opcional)
   */
  @Get()
  async getPendingDocuments(
    @Request() req: any,
    @Query('status') status?: string,
  ) {
    try {
      const userId = req.user?.sub || req.user?.userId;
      
      if (!userId) {
        throw new HttpException('User ID not found in token', HttpStatus.UNAUTHORIZED);
      }
      
      // Busca company_id do usuário
      const companyId = await this.getCompanyIdForUser(userId);
      const result = await this.getPendingDocumentsUseCase.execute({
        companyId,
        status: status as any,
      });
      return result;
    } catch (error) {
      console.error('[PendingDocumentController] Erro ao listar documentos:', error);
      throw new HttpException(
        error.message || 'Erro ao listar documentos',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /financial/pending-documents/:id
   * 
   * Busca detalhes de um documento pendente (preview).
   */
  @Get(':id')
  async getDocumentDetails(
    @Param('id') documentId: string,
    @Request() req: any,
  ) {
    try {
      const userId = req.user?.sub || req.user?.userId;
      
      if (!userId) {
        throw new HttpException('User ID not found in token', HttpStatus.UNAUTHORIZED);
      }

      // Busca company_id do usuário para validar acesso
      const companyId = await this.getCompanyIdForUser(userId);

      // Busca documento pelo repository
      const document = await this.pendingDocumentRepository.findById(documentId);

      if (!document) {
        throw new HttpException('Documento não encontrado', HttpStatus.NOT_FOUND);
      }

      // Valida que o documento pertence à empresa do usuário
      if (document.companyId !== companyId) {
        throw new HttpException('Sem permissão para acessar este documento', HttpStatus.FORBIDDEN);
      }

      // Retorna preview
      return {
        success: true,
        document: {
          id: document.id,
          fileName: document.fileName,
          fileSize: document.fileSize,
          status: document.status.value,
          uploadedBy: document.userId,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
          rawData: {
            headers: document.rawData.headers,
            sampleRows: document.rawData.rows.slice(0, 10), // Primeiras 10 linhas
            totalRows: document.rawData.totalRows,
          },
          columnMapping: document.columnMapping?.toJSON() || null,
          validationResult: document.validationResult || null,
        },
      };
    } catch (error) {
      console.error('[PendingDocumentController] Erro:', error);
      throw new HttpException(
        error.message || 'Erro ao buscar documento',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /financial/pending-documents/:id/map
   * 
   * Define mapeamento de colunas do documento.
   * 
   * Body:
   * {
   *   columnMapping: {
   *     date: "Data",
   *     amount: "Valor",
   *     description: "Descrição", // opcional
   *     category: "Categoria",     // opcional
   *     type: "Tipo"              // opcional
   *   }
   * }
   */
  @Post(':id/map')
  async mapDocumentColumns(
    @Param('id') documentId: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    try {
      if (!body.columnMapping) {
        throw new HttpException(
          'columnMapping é obrigatório',
          HttpStatus.BAD_REQUEST,
        );
      }

      const userId = req.user?.sub || req.user?.userId;
      if (!userId) {
        throw new HttpException('User ID not found in token', HttpStatus.UNAUTHORIZED);
      }

      const companyId = await this.getCompanyIdForUser(userId);
      const document = await this.pendingDocumentRepository.findById(documentId);
      if (!document) {
        throw new HttpException('Documento não encontrado', HttpStatus.NOT_FOUND);
      }
      if (document.companyId !== companyId) {
        throw new HttpException('Sem permissão para acessar este documento', HttpStatus.FORBIDDEN);
      }

      const result = await this.mapDocumentColumnsUseCase.execute({
        documentId,
        userId,
        columnMapping: body.columnMapping,
      });

      return result;
    } catch (error) {
      console.error('[PendingDocumentController] Erro ao mapear:', error);
      throw new HttpException(
        error.message || 'Erro ao mapear colunas',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /financial/pending-documents/:id/validate
   * 
   * Valida os dados do documento.
   */
  @Post(':id/validate')
  async validateDocument(
    @Param('id') documentId: string,
    @Request() req: any,
  ) {
    try {
      const userId = req.user?.sub || req.user?.userId;
      if (!userId) {
        throw new HttpException('User ID not found in token', HttpStatus.UNAUTHORIZED);
      }

      const companyId = await this.getCompanyIdForUser(userId);
      const document = await this.pendingDocumentRepository.findById(documentId);
      if (!document) {
        throw new HttpException('Documento não encontrado', HttpStatus.NOT_FOUND);
      }
      if (document.companyId !== companyId) {
        throw new HttpException('Sem permissão para acessar este documento', HttpStatus.FORBIDDEN);
      }

      const result = await this.validateDocumentUseCase.execute({
        documentId,
        userId,
      });

      return result;
    } catch (error) {
      console.error('[PendingDocumentController] Erro ao validar:', error);
      throw new HttpException(
        error.message || 'Erro ao validar documento',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /financial/pending-documents/:id/approve
   * 
   * Aprova o documento e importa transações.
   */
  @Post(':id/approve')
  async approveDocument(
    @Param('id') documentId: string,
    @Request() req: any,
  ) {
    try {
      const userId = req.user?.sub || req.user?.userId;
      if (!userId) {
        throw new HttpException('User ID not found in token', HttpStatus.UNAUTHORIZED);
      }

      const companyId = await this.getCompanyIdForUser(userId);
      const document = await this.pendingDocumentRepository.findById(documentId);
      if (!document) {
        throw new HttpException('Documento não encontrado', HttpStatus.NOT_FOUND);
      }
      if (document.companyId !== companyId) {
        throw new HttpException('Sem permissão para acessar este documento', HttpStatus.FORBIDDEN);
      }

      const result = await this.approveDocumentUseCase.execute({
        documentId,
        userId,
      });

      return result;
    } catch (error) {
      console.error('[PendingDocumentController] Erro ao aprovar:', error);
      throw new HttpException(
        error.message || 'Erro ao aprovar documento',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /financial/pending-documents/:id/reject
   * 
   * Rejeita o documento.
   * 
   * Body:
   * {
   *   notes: "Razão da rejeição" // opcional
   * }
   */
  @Post(':id/reject')
  async rejectDocument(
    @Param('id') documentId: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    try {
      const userId = req.user?.sub || req.user?.userId;
      if (!userId) {
        throw new HttpException('User ID not found in token', HttpStatus.UNAUTHORIZED);
      }

      const companyId = await this.getCompanyIdForUser(userId);
      const document = await this.pendingDocumentRepository.findById(documentId);
      if (!document) {
        throw new HttpException('Documento não encontrado', HttpStatus.NOT_FOUND);
      }
      if (document.companyId !== companyId) {
        throw new HttpException('Sem permissão para acessar este documento', HttpStatus.FORBIDDEN);
      }

      const rejectResult = document.reject(body?.notes);
      if (rejectResult.isFailure) {
        throw new HttpException(rejectResult.error || 'Erro ao rejeitar documento', HttpStatus.BAD_REQUEST);
      }

      await this.pendingDocumentRepository.save(document);

      return {
        success: true,
        message: 'Documento rejeitado com sucesso',
        documentId: document.id,
        status: document.status.value,
      };
    } catch (error) {
      console.error('[PendingDocumentController] Erro ao rejeitar:', error);
      throw new HttpException(
        error.message || 'Erro ao rejeitar documento',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
