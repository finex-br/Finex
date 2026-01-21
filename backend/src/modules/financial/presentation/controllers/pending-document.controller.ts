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
  Headers,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '../../../authentication/presentation/http/guards/jwt-auth.guard';
import { ColumnMapping } from '../../domain/value-objects/column-mapping';
import { DocumentStatus } from '../../domain/value-objects/document-status';
import { UploadRawDocumentUseCase } from '../../application/use-cases/upload-raw-document.use-case';
import { MapDocumentColumnsUseCase } from '../../application/use-cases/map-document-columns.use-case';
import { ValidateDocumentUseCase } from '../../application/use-cases/validate-document.use-case';
import { ApproveDocumentUseCase } from '../../application/use-cases/approve-document.use-case';
import { GetPendingDocumentsUseCase } from '../../application/use-cases/get-pending-documents.use-case';
import { IPendingDocumentRepository } from '../../domain/ports/pending-document-repository.interface';
import { resolveCompanyContext } from '../../../../shared/tenant/company-context';

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

  private async resolveCompany(
    req: any,
    requestedCompanyId?: string,
  ): Promise<{ userId: string; isAdmin: boolean; companyId?: string }> {
    const ctx = await resolveCompanyContext(this.dataSource, req, requestedCompanyId, {
      allowAllCompaniesForAdmin: true,
    });
    return { userId: ctx.userId, isAdmin: ctx.isSystemAdmin, companyId: ctx.companyId };
  }

  private isSystemAdmin(req: any): boolean {
    const tokenRole = String(req.user?.role || '').toUpperCase();
    return tokenRole === 'ADMIN';
  }

  /**
   * Somente ADMIN (sistema) pode aprovar/rejeitar/editar documento (overrides/exclusions).
   */
  private assertUserIsSystemAdmin(req: any): void {
    const userId = req.user?.sub || req.user?.userId;
    if (!userId) {
      throw new HttpException('User ID not found in token', HttpStatus.UNAUTHORIZED);
    }

    if (!this.isSystemAdmin(req)) {
      throw new HttpException('Only system ADMIN can perform this action', HttpStatus.FORBIDDEN);
    }
  }

  private getRowIndexForRowNumber(rawData: any, rowNumber: number): number {
    const rowNumbers: number[] | undefined = rawData?.rowNumbers;

    if (Array.isArray(rowNumbers)) {
      const idx = rowNumbers.findIndex((n) => n === rowNumber);
      return idx;
    }

    // Fallback for older uploads that didn't persist rowNumbers
    return rowNumber - 2;
  }

  private buildRowSnapshot(rawData: any, rowNumber: number): {
    rowIndex: number;
    rowValues: any[] | null;
    rowData: Record<string, any> | null;
  } {
    const rowIndex = this.getRowIndexForRowNumber(rawData, rowNumber);
    const headers: string[] = rawData?.headers || [];
    const rowValues: any[] | null = rawData?.rows?.[rowIndex] || null;

    if (!rowValues || !Array.isArray(headers) || headers.length === 0) {
      return { rowIndex, rowValues: rowValues || null, rowData: null };
    }

    const rowData: Record<string, any> = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i] || `col_${i + 1}`;
      rowData[header] = rowValues[i];
    }

    return { rowIndex, rowValues, rowData };
  }

  private enrichValidationResultWithRows(document: any) {
    const validationResult = document?.validationResult;
    const rawData = document?.rawData;

    if (!validationResult || !rawData) return validationResult;

    const enrichEntry = (entry: any) => {
      const snapshot = this.buildRowSnapshot(rawData, entry.row);
      return {
        ...entry,
        rowIndex: snapshot.rowIndex,
        rowValues: snapshot.rowValues,
        rowData: snapshot.rowData,
      };
    };

    return {
      ...validationResult,
      errors: Array.isArray(validationResult.errors)
        ? validationResult.errors.map(enrichEntry)
        : [],
      warnings: Array.isArray(validationResult.warnings)
        ? validationResult.warnings.map(enrichEntry)
        : [],
    };
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
    @Headers('x-company-id') xCompanyId?: string,
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

      const { userId, companyId } = await this.resolveCompany(req, xCompanyId);

      if (!companyId) {
        throw new HttpException('X-Company-Id is required to upload a document', HttpStatus.BAD_REQUEST);
      }

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

      const message = String(error?.message || 'Erro ao processar documento');
      if (message.startsWith('DUPLICATE_DOCUMENT:')) {
        throw new HttpException(message.replace('DUPLICATE_DOCUMENT:', '').trim(), HttpStatus.CONFLICT);
      }

      throw new HttpException(
        message,
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
    @Query('companyId') companyIdQuery?: string,
    @Headers('x-company-id') xCompanyId?: string,
  ) {
    try {
      const { isAdmin, companyId } = await this.resolveCompany(req, xCompanyId);

      // ADMIN do sistema: pode listar documentos de qualquer empresa
      if (isAdmin) {
        const all = await this.pendingDocumentRepository.findAll();
        const normalizedCompanyIdQuery = String(companyIdQuery || '').trim();
        let filtered = normalizedCompanyIdQuery
          ? all.filter((d) => d.companyId === normalizedCompanyIdQuery)
          : all;

        if (status) {
          const statusResult = DocumentStatus.create(status as any);
          if (statusResult.isFailure) {
            throw new HttpException(statusResult.error || 'Status inválido', HttpStatus.BAD_REQUEST);
          }
          const wanted = statusResult.getValue().value;
          filtered = filtered.filter((d) => d.status.value === wanted);
        }

        return {
          success: true,
          documents: filtered.map((doc) => ({
            id: doc.id,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            status: doc.status.value,
            totalRows: doc.rawData.totalRows,
            hasMapping: !!doc.columnMapping,
            hasValidation: !!doc.validationResult,
            createdAt: doc.createdAt!,
            updatedAt: doc.updatedAt!,
            uploadedBy: doc.userId,
            companyId: doc.companyId,
          })),
          total: filtered.length,
        };
      }

      // Usuário normal: lista documentos da sua empresa
      if (!companyId) {
        throw new HttpException('Company context not resolved', HttpStatus.BAD_REQUEST);
      }

      const result = await this.getPendingDocumentsUseCase.execute({ companyId, status: status as any });
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
    @Headers('x-company-id') xCompanyId?: string,
  ) {
    try {
      const { isAdmin, companyId } = await this.resolveCompany(req, xCompanyId);

      // Busca documento pelo repository
      const document = await this.pendingDocumentRepository.findById(documentId);

      if (!document) {
        throw new HttpException('Documento não encontrado', HttpStatus.NOT_FOUND);
      }

      // Valida que o documento pertence à empresa do usuário
      if (!isAdmin && document.companyId !== companyId) {
        throw new HttpException('Sem permissão para acessar este documento', HttpStatus.FORBIDDEN);
      }

      // Retorna preview
      return {
        success: true,
        document: {
          id: document.id,
          companyId: document.companyId,
          fileName: document.fileName,
          fileSize: document.fileSize,
          status: document.status.value,
          uploadedBy: document.userId,
          notes: document.notes || null,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
          rawData: {
            headers: document.rawData.headers,
            sampleRows: document.rawData.rows.slice(0, 10), // Primeiras 10 linhas
            totalRows: document.rawData.totalRows,
          },
          columnMapping: document.columnMapping?.toJSON() || null,
          validationResult: this.enrichValidationResultWithRows(document) || null,
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
    @Headers('x-company-id') xCompanyId: string | undefined,
    @Request() req: any,
  ) {
    try {
      if (!body.columnMapping) {
        throw new HttpException(
          'columnMapping é obrigatório',
          HttpStatus.BAD_REQUEST,
        );
      }

      const { userId, isAdmin, companyId } = await this.resolveCompany(req, xCompanyId);
      const document = await this.pendingDocumentRepository.findById(documentId);
      if (!document) {
        throw new HttpException('Documento não encontrado', HttpStatus.NOT_FOUND);
      }
      if (!isAdmin && document.companyId !== companyId) {
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
   * POST /financial/pending-documents/:id/overrides
   * 
   * Salva correções por linha (overrides) para permitir que um ADMIN/OWNER
   * ajuste campos obrigatórios (ex.: date/amount) em linhas específicas.
   * 
   * Body:
   * {
   *   overrides: {
   *     "22": { date: "2025-01-10", amount: "123,45" }
   *   }
   * }
   */
  @Post(':id/overrides')
  async saveRowOverrides(
    @Param('id') documentId: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    try {
      const userId = req.user?.sub || req.user?.userId;
      if (!userId) {
        throw new HttpException('User ID not found in token', HttpStatus.UNAUTHORIZED);
      }

      this.assertUserIsSystemAdmin(req);

      if (!body?.overrides || typeof body.overrides !== 'object') {
        throw new HttpException('overrides é obrigatório', HttpStatus.BAD_REQUEST);
      }

      const document = await this.pendingDocumentRepository.findById(documentId);
      if (!document) {
        throw new HttpException('Documento não encontrado', HttpStatus.NOT_FOUND);
      }
      if (!document.columnMapping) {
        throw new HttpException('Documento não possui mapeamento salvo', HttpStatus.BAD_REQUEST);
      }

      const current = document.columnMapping.toJSON();
      const mergedOverrides = {
        ...(current.overrides || {}),
        ...body.overrides,
      };

      const existingAudit = Array.isArray((current as any).audit) ? (current as any).audit : [];
      const auditEntry = {
        at: new Date().toISOString(),
        userId,
        action: 'OVERRIDE' as const,
        details: body.overrides,
      };

      const mappingResult = ColumnMapping.create({
        ...current,
        overrides: mergedOverrides,
        audit: [...existingAudit, auditEntry],
      } as any);

      if (mappingResult.isFailure) {
        throw new HttpException(mappingResult.error || 'Mapeamento inválido', HttpStatus.BAD_REQUEST);
      }

      const updateResult = document.setColumnMapping(mappingResult.getValue());
      if (updateResult.isFailure) {
        throw new HttpException(updateResult.error || 'Erro ao salvar correções', HttpStatus.BAD_REQUEST);
      }

      await this.pendingDocumentRepository.save(document);

      return {
        success: true,
        message: 'Correções salvas. Revalide o documento para atualizar os resultados.',
        documentId: document.id,
      };
    } catch (error) {
      console.error('[PendingDocumentController] Erro ao salvar overrides:', error);
      throw new HttpException(
        error.message || 'Erro ao salvar correções',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /financial/pending-documents/:id/exclusions
   * 
   * Marca linhas do Excel como "excluídas" (ignoradas na validação e na importação).
   * Útil para linhas de TOTAL, cabeçalhos duplicados, observações, etc.
   * 
   * Body:
   * { rows: [22, 23, 24] }
   */
  @Post(':id/exclusions')
  async excludeRows(
    @Param('id') documentId: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    try {
      const userId = req.user?.sub || req.user?.userId;
      if (!userId) {
        throw new HttpException('User ID not found in token', HttpStatus.UNAUTHORIZED);
      }

      this.assertUserIsSystemAdmin(req);

      const rows: number[] = Array.isArray(body?.rows)
        ? body.rows.map((n: any) => Number(n)).filter((n: number) => Number.isFinite(n))
        : [];

      if (rows.length === 0) {
        throw new HttpException('rows é obrigatório (array de números)', HttpStatus.BAD_REQUEST);
      }

      const document = await this.pendingDocumentRepository.findById(documentId);
      if (!document) {
        throw new HttpException('Documento não encontrado', HttpStatus.NOT_FOUND);
      }
      if (!document.columnMapping) {
        throw new HttpException('Documento não possui mapeamento salvo', HttpStatus.BAD_REQUEST);
      }

      const current = document.columnMapping.toJSON() as any;
      const existing: number[] = Array.isArray(current.excludedRows) ? current.excludedRows : [];
      const merged = Array.from(new Set([...existing, ...rows])).sort((a, b) => a - b);

      const existingAudit = Array.isArray((current as any).audit) ? (current as any).audit : [];
      const auditEntry = {
        at: new Date().toISOString(),
        userId,
        action: 'EXCLUDE' as const,
        details: { rows },
      };

      const mappingResult = ColumnMapping.create({
        ...current,
        excludedRows: merged,
        audit: [...existingAudit, auditEntry],
      } as any);

      if (mappingResult.isFailure) {
        throw new HttpException(mappingResult.error || 'Mapeamento inválido', HttpStatus.BAD_REQUEST);
      }

      const updateResult = document.setColumnMapping(mappingResult.getValue());
      if (updateResult.isFailure) {
        throw new HttpException(updateResult.error || 'Erro ao excluir linhas', HttpStatus.BAD_REQUEST);
      }

      await this.pendingDocumentRepository.save(document);

      return {
        success: true,
        message: `Linhas excluídas: ${rows.join(', ')}. Revalide o documento para atualizar os resultados.`,
        documentId: document.id,
        excludedRows: merged,
      };
    } catch (error) {
      console.error('[PendingDocumentController] Erro ao excluir linhas:', error);
      throw new HttpException(
        error.message || 'Erro ao excluir linhas',
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
    @Headers('x-company-id') xCompanyId: string | undefined,
    @Request() req: any,
  ) {
    try {
      const { userId, isAdmin, companyId } = await this.resolveCompany(req, xCompanyId);
      const document = await this.pendingDocumentRepository.findById(documentId);
      if (!document) {
        throw new HttpException('Documento não encontrado', HttpStatus.NOT_FOUND);
      }
      if (!isAdmin && document.companyId !== companyId) {
        throw new HttpException('Sem permissão para acessar este documento', HttpStatus.FORBIDDEN);
      }

      const result = await this.validateDocumentUseCase.execute({
        documentId,
        userId,
      });

      // Recarregar documento para retornar erros com snapshot da linha
      const updated = await this.pendingDocumentRepository.findById(documentId);

      return {
        ...result,
        errors: this.enrichValidationResultWithRows(updated)?.errors || result.errors,
        warnings: this.enrichValidationResultWithRows(updated)?.warnings || result.warnings,
      };
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

      this.assertUserIsSystemAdmin(req);
      const document = await this.pendingDocumentRepository.findById(documentId);
      if (!document) {
        throw new HttpException('Documento não encontrado', HttpStatus.NOT_FOUND);
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

      this.assertUserIsSystemAdmin(req);
      const document = await this.pendingDocumentRepository.findById(documentId);
      if (!document) {
        throw new HttpException('Documento não encontrado', HttpStatus.NOT_FOUND);
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
