import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IPendingDocumentRepository } from '../../domain/ports/pending-document-repository.interface';
import {
  GetPendingDocumentsRequestDTO,
  GetPendingDocumentsResponseDTO,
  PendingDocumentSummaryDTO,
} from '../dtos/pending-document.dto';
import { DocumentStatus } from '../../domain/value-objects/document-status';

/**
 * GetPendingDocumentsUseCase - Application Layer
 * 
 * Lista documentos pendentes de uma empresa.
 * Pode filtrar por status.
 */
export class GetPendingDocumentsUseCase
  implements IUseCase<GetPendingDocumentsRequestDTO, GetPendingDocumentsResponseDTO>
{
  constructor(private pendingDocumentRepository: IPendingDocumentRepository) {}

  async execute(
    request: GetPendingDocumentsRequestDTO,
  ): Promise<GetPendingDocumentsResponseDTO> {
    if (!request.companyId) {
      throw new Error('CompanyId é obrigatório');
    }

    console.log('[GetPendingDocumentsUseCase] Buscando para companyId:', request.companyId);
    console.log('[GetPendingDocumentsUseCase] Status filter:', request.status);

    // Buscar documentos
    let documents;

    if (request.status) {
      const statusResult = DocumentStatus.create(request.status);
      if (statusResult.isFailure) {
        throw new Error(statusResult.error);
      }
      documents = await this.pendingDocumentRepository.findByStatus(
        request.companyId,
        statusResult.getValue(),
      );
    } else {
      documents = await this.pendingDocumentRepository.findByCompanyId(request.companyId);
    }

    console.log('[GetPendingDocumentsUseCase] Found documents:', documents.length);

    // Mapear para DTOs
    const summaries: PendingDocumentSummaryDTO[] = documents.map(doc => ({
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
    }));

    return {
      success: true,
      documents: summaries,
      total: summaries.length,
    };
  }
}
