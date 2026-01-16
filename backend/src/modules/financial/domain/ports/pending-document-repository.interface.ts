import { PendingDocument } from '../entities/pending-document';
import { DocumentStatus } from '../value-objects/document-status';

/**
 * IPendingDocumentRepository - Port (Interface)
 * 
 * Define o contrato para persistência de documentos pendentes.
 */
export interface IPendingDocumentRepository {
  /**
   * Salva um documento pendente
   */
  save(document: PendingDocument): Promise<void>;

  /**
   * Busca documento por ID
   */
  findById(id: string): Promise<PendingDocument | null>;

  /**
   * Lista todos os documentos de uma empresa
   */
  findByCompanyId(companyId: string): Promise<PendingDocument[]>;

  /**
   * Lista documentos por status
   */
  findByStatus(companyId: string, status: DocumentStatus): Promise<PendingDocument[]>;

  /**
   * Lista documentos pendentes (UPLOADED ou MAPPED)
   */
  findPendingDocuments(companyId: string): Promise<PendingDocument[]>;

  /**
   * Lista todos os documentos (uso do ADMIN do sistema)
   */
  findAll(): Promise<PendingDocument[]>;

  /**
   * Busca documento por hash do arquivo dentro de uma empresa (para deduplicação)
   */
  findByCompanyIdAndFileHash(companyId: string, fileHash: string): Promise<PendingDocument | null>;

  /**
   * Deleta um documento
   */
  delete(id: string): Promise<void>;

  /**
   * Busca documentos por usuário
   */
  findByUserId(userId: string): Promise<PendingDocument[]>;
}
