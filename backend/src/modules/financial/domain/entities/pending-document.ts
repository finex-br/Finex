import { Result } from '../../../../shared/core/result';
import { DocumentStatus, DocumentStatusEnum } from '../value-objects/document-status';
import { ColumnMapping } from '../value-objects/column-mapping';

export interface PendingDocumentProps {
  id: string;
  companyId: string;
  userId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storagePath?: string; // Path do arquivo no storage (S3, local, etc)
  status: DocumentStatus;
  rawData: {
    headers: string[];
    rows: any[][];
    totalRows: number;
  };
  columnMapping?: ColumnMapping | null;
  validationResult?: {
    isValid: boolean;
    errors: Array<{ row: number; field: string; message: string }>;
    warnings: Array<{ row: number; field: string; message: string }>;
    validTransactions: number;
    invalidTransactions: number;
  } | null;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * PendingDocument - Domain Entity
 * 
 * Representa um documento enviado aguardando processamento.
 */
export class PendingDocument {
  private constructor(private props: PendingDocumentProps) {}

  get id(): string {
    return this.props.id;
  }

  get companyId(): string {
    return this.props.companyId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get fileName(): string {
    return this.props.fileName;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get fileSize(): number {
    return this.props.fileSize;
  }

  get storagePath(): string | undefined {
    return this.props.storagePath;
  }

  get status(): DocumentStatus {
    return this.props.status;
  }

  get rawData(): PendingDocumentProps['rawData'] {
    return this.props.rawData;
  }

  get columnMapping(): ColumnMapping | null | undefined {
    return this.props.columnMapping;
  }

  get validationResult(): PendingDocumentProps['validationResult'] {
    return this.props.validationResult;
  }

  get notes(): string | null | undefined {
    return this.props.notes;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  /**
   * Cria um novo documento pendente
   */
  public static create(props: PendingDocumentProps): Result<PendingDocument> {
    // Validações de domínio
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail<PendingDocument>('ID é obrigatório');
    }

    if (!props.companyId || props.companyId.trim().length === 0) {
      return Result.fail<PendingDocument>('CompanyId é obrigatório');
    }

    if (!props.userId || props.userId.trim().length === 0) {
      return Result.fail<PendingDocument>('UserId é obrigatório');
    }

    if (!props.fileName || props.fileName.trim().length === 0) {
      return Result.fail<PendingDocument>('Nome do arquivo é obrigatório');
    }

    // fileSize é opcional (pode ser 0 para documentos existentes)
    // if (props.fileSize <= 0) {
    //   return Result.fail<PendingDocument>('Tamanho do arquivo deve ser maior que zero');
    // }

    if (!props.rawData || !props.rawData.headers || props.rawData.headers.length === 0) {
      return Result.fail<PendingDocument>('Dados brutos (headers) são obrigatórios');
    }

    return Result.ok<PendingDocument>(new PendingDocument(props));
  }

  /**
   * Define o mapeamento de colunas
   */
  public setColumnMapping(mapping: ColumnMapping): Result<void> {
    if (!this.status.isUploaded()) {
      return Result.fail('Só é possível mapear colunas em documentos com status UPLOADED');
    }

    this.props.columnMapping = mapping;
    
    const newStatusResult = DocumentStatus.create(DocumentStatusEnum.MAPPED);
    if (newStatusResult.isFailure) {
      return Result.fail(newStatusResult.error || 'Erro ao criar status');
    }

    this.props.status = newStatusResult.getValue();
    this.props.updatedAt = new Date();

    return Result.ok();
  }

  /**
   * Define o resultado da validação
   */
  public setValidationResult(result: PendingDocumentProps['validationResult']): Result<void> {
    if (!this.status.isMapped()) {
      return Result.fail('Só é possível validar documentos com status MAPPED');
    }

    this.props.validationResult = result;
    
    const newStatusResult = DocumentStatus.create(DocumentStatusEnum.VALIDATED);
    if (newStatusResult.isFailure) {
      return Result.fail(newStatusResult.error || 'Erro ao criar status');
    }

    this.props.status = newStatusResult.getValue();
    this.props.updatedAt = new Date();

    return Result.ok();
  }

  /**
   * Aprova o documento
   */
  public approve(userId: string): Result<void> {
    if (!this.status.isValidated()) {
      return Result.fail('Só é possível aprovar documentos com status VALIDATED');
    }

    if (!this.validationResult?.isValid) {
      return Result.fail('Não é possível aprovar um documento com erros de validação');
    }

    const newStatusResult = DocumentStatus.create(DocumentStatusEnum.APPROVED);
    if (newStatusResult.isFailure) {
      return Result.fail(newStatusResult.error || 'Erro ao criar status');
    }

    this.props.status = newStatusResult.getValue();
    this.props.updatedAt = new Date();

    return Result.ok();
  }

  /**
   * Rejeita o documento
   */
  public reject(notes?: string): Result<void> {
    if (this.status.isApproved()) {
      return Result.fail('Não é possível rejeitar um documento já aprovado');
    }

    const newStatusResult = DocumentStatus.create(DocumentStatusEnum.REJECTED);
    if (newStatusResult.isFailure) {
      return Result.fail(newStatusResult.error || 'Erro ao criar status');
    }

    this.props.status = newStatusResult.getValue();
    
    if (notes) {
      this.props.notes = notes;
    }
    
    this.props.updatedAt = new Date();

    return Result.ok();
  }

  /**
   * Adiciona notas ao documento
   */
  public addNotes(notes: string): void {
    this.props.notes = notes;
    this.props.updatedAt = new Date();
  }

  /**
   * Retorna preview dos dados (primeiras 5 linhas)
   */
  public getPreview(): { headers: string[]; sampleRows: any[][] } {
    return {
      headers: this.rawData.headers,
      sampleRows: this.rawData.rows.slice(0, 5),
    };
  }
}
