import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IExcelAnalyzer } from '../../domain/ports/excel-analyzer.interface';
import { IPendingDocumentRepository } from '../../domain/ports/pending-document-repository.interface';
import { PendingDocument } from '../../domain/entities/pending-document';
import { DocumentStatus, DocumentStatusEnum } from '../../domain/value-objects/document-status';
import { ColumnMapping } from '../../domain/value-objects/column-mapping';
import {
  UploadRawDocumentRequestDTO,
  UploadRawDocumentResponseDTO,
} from '../dtos/pending-document.dto';

/**
 * UploadRawDocumentUseCase - Application Layer
 * 
 * Faz upload de um documento sem processá-lo completamente.
 * Apenas extrai estrutura (headers, sample rows) para permitir mapeamento.
 * 
 * Fluxo:
 * 1. Analisa estrutura do Excel
 * 2. Tenta criar mapeamento automático (sugestão)
 * 3. Salva documento com status UPLOADED
 * 4. Retorna preview e sugestão de mapeamento
 */
export class UploadRawDocumentUseCase
  implements IUseCase<UploadRawDocumentRequestDTO, UploadRawDocumentResponseDTO>
{
  constructor(
    private excelAnalyzer: IExcelAnalyzer,
    private pendingDocumentRepository: IPendingDocumentRepository,
  ) {}

  async execute(
    request: UploadRawDocumentRequestDTO,
  ): Promise<UploadRawDocumentResponseDTO> {
    // 1. Validar request
    if (!request.companyId || !request.userId) {
      throw new Error('CompanyId e UserId são obrigatórios');
    }

    if (!request.fileBuffer || request.fileBuffer.length === 0) {
      throw new Error('Arquivo vazio');
    }

    // 2. Deduplicação (mesmo arquivo dentro da mesma empresa)
    const fileHash = createHash('sha256').update(request.fileBuffer).digest('hex');
    const existing = await this.pendingDocumentRepository.findByCompanyIdAndFileHash(
      request.companyId,
      fileHash,
    );
    if (existing) {
      throw new Error('DUPLICATE_DOCUMENT: Este arquivo já foi enviado anteriormente');
    }

    // 3. Analisar estrutura do Excel
    const structure = await this.excelAnalyzer.analyzeStructure(request.fileBuffer);

    if (structure.headers.length === 0) {
      throw new Error('Arquivo não possui cabeçalhos (headers)');
    }

    if (structure.totalRows === 0) {
      throw new Error('Arquivo não possui dados (rows)');
    }

    // 4. Tentar criar mapeamento automático (sugestão)
    const autoMappingResult = ColumnMapping.createAutoMapping(structure.headers);
    const suggestedMapping = autoMappingResult.isSuccess
      ? autoMappingResult.getValue().toJSON()
      : undefined;

    // 5. Criar entidade de domínio
    const statusResult = DocumentStatus.create(DocumentStatusEnum.UPLOADED);
    if (statusResult.isFailure) {
      throw new Error(statusResult.error);
    }

    const documentId = uuidv4();

    const documentResult = PendingDocument.create({
      id: documentId,
      companyId: request.companyId,
      userId: request.userId,
      fileName: request.fileName,
      mimeType: request.mimeType,
      fileSize: request.fileSize,
      status: statusResult.getValue(),
      rawData: {
        ...structure,
        metadata: {
          ...(structure as any)?.metadata,
          fileHash,
        },
      } as any,
      columnMapping: null,
      validationResult: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (documentResult.isFailure) {
      throw new Error(documentResult.error);
    }

    const document = documentResult.getValue();

    // 6. Persistir documento
    await this.pendingDocumentRepository.save(document);

    // 7. Retornar resposta com preview
    return {
      success: true,
      documentId: document.id,
      message: `Documento "${request.fileName}" carregado com sucesso. Aguardando mapeamento de colunas.`,
      preview: {
        headers: structure.headers,
        sampleRows: structure.rows.slice(0, 5), // Primeiras 5 linhas
        totalRows: structure.totalRows,
      },
      suggestedMapping,
    };
  }
}
