import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPendingDocumentRepository } from '../../../domain/ports/pending-document-repository.interface';
import { PendingDocument } from '../../../domain/entities/pending-document';
import { FinancialUploadSchema } from './financial-upload.schema';
import { DocumentStatus } from '../../../domain/value-objects/document-status';
import { ColumnMapping } from '../../../domain/value-objects/column-mapping';

/**
 * TypeORMFinancialUploadRepository - Infrastructure Layer
 * 
 * Implementação do repositório usando financial_uploads (tabela existente).
 */
@Injectable()
export class TypeORMFinancialUploadRepository implements IPendingDocumentRepository {
  constructor(
    @InjectRepository(FinancialUploadSchema)
    private readonly repository: Repository<FinancialUploadSchema>,
  ) {}

  async save(document: PendingDocument): Promise<void> {
    // Salva fileSize e mimeType dentro de raw_data.metadata
    const rawDataWithMetadata = {
      ...document.rawData,
      metadata: {
        fileSize: document.fileSize,
        mimeType: document.mimeType,
      },
    };

    const schema: Partial<FinancialUploadSchema> = {
      id: document.id,
      companyId: document.companyId,
      userId: document.userId,
      filename: document.fileName,
      storagePath: document.storagePath || '',
      status: this.mapDomainStatusToDb(document.status),
      rawData: rawDataWithMetadata as any,
      columnMapping: document.columnMapping ? document.columnMapping.toJSON() : null,
      validationResult: document.validationResult || null,
    };

    await this.repository.save(schema as FinancialUploadSchema);
  }

  async findById(id: string): Promise<PendingDocument | null> {
    const schema = await this.repository.findOne({ where: { id } });
    
    if (!schema) {
      return null;
    }

    return this.toDomain(schema);
  }

  async findByCompanyId(companyId: string): Promise<PendingDocument[]> {
    const schemas = await this.repository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });

    return schemas.map(schema => this.toDomain(schema));
  }

  async findByStatus(companyId: string, status: DocumentStatus): Promise<PendingDocument[]> {
    const dbStatus = this.mapDomainStatusToDb(status);
    const schemas = await this.repository.find({
      where: { companyId, status: dbStatus },
      order: { createdAt: 'DESC' },
    });

    return schemas.map(schema => this.toDomain(schema));
  }

  async findPendingDocuments(companyId: string): Promise<PendingDocument[]> {
    const schemas = await this.repository.find({
      where: [
        { companyId, status: 'UPLOADED' },
        { companyId, status: 'MAPPED' },
        { companyId, status: 'VALIDATED' },
      ],
      order: { createdAt: 'DESC' },
    });

    return schemas.map(schema => this.toDomain(schema));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByUserId(userId: string): Promise<PendingDocument[]> {
    const schemas = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return schemas.map(schema => this.toDomain(schema));
  }

  /**
   * Converte schema do TypeORM para entidade de domínio
   */
  private toDomain(schema: FinancialUploadSchema): PendingDocument {
    const statusResult = DocumentStatus.create(this.mapDbStatusToDomain(schema.status));
    if (statusResult.isFailure) {
      throw new Error(`Status inválido: ${schema.status}`);
    }

    let columnMapping: ColumnMapping | null = null;
    if (schema.columnMapping) {
      const mappingResult = ColumnMapping.create(schema.columnMapping);
      if (mappingResult.isSuccess) {
        columnMapping = mappingResult.getValue();
      }
    }

    // Extrai metadata de raw_data se disponível
    const rawData = schema.rawData || { headers: [], rows: [], totalRows: 0 };
    const metadata = (rawData as any).metadata || {};

    const documentResult = PendingDocument.create({
      id: schema.id,
      companyId: schema.companyId,
      userId: schema.userId,
      fileName: schema.filename,
      mimeType: metadata.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileSize: metadata.fileSize || 0,
      storagePath: schema.storagePath,
      status: statusResult.getValue(),
      rawData: rawData,
      columnMapping,
      validationResult: schema.validationResult,
      notes: null,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    });

    if (documentResult.isFailure) {
      throw new Error(`Erro ao criar entidade: ${documentResult.error}`);
    }

    return documentResult.getValue();
  }

  /**
   * Mapeia status do domínio para banco
   */
  private mapDomainStatusToDb(status: DocumentStatus): FinancialUploadSchema['status'] {
    const mapping: Record<string, FinancialUploadSchema['status']> = {
      'UPLOADED': 'UPLOADED',
      'MAPPED': 'MAPPED',
      'VALIDATED': 'VALIDATED',
      'APPROVED': 'DONE',
      'REJECTED': 'REJECTED',
    };

    return mapping[status.value] || 'UPLOADED';
  }

  /**
   * Mapeia status do banco para domínio
   */
  private mapDbStatusToDomain(dbStatus: string): string {
    const mapping: Record<string, string> = {
      'UPLOADED': 'UPLOADED',
      'MAPPED': 'MAPPED',
      'VALIDATED': 'VALIDATED',
      'PROCESSING': 'VALIDATED', // Mapeia PROCESSING para VALIDATED no domínio
      'DONE': 'APPROVED',
      'ERROR': 'REJECTED',
      'REJECTED': 'REJECTED',
    };

    return mapping[dbStatus] || 'UPLOADED';
  }
}
