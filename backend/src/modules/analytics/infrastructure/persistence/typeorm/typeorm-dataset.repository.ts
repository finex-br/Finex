import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IDatasetRepository } from '../../../domain/ports/dataset-repository.interface';
import { Dataset } from '../../../domain/entities/dataset';
import { DatasetSchema } from './dataset.schema';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';

@Injectable()
export class TypeormDatasetRepository implements IDatasetRepository {
  constructor(
    @InjectRepository(DatasetSchema)
    private readonly repo: Repository<DatasetSchema>,
  ) {}

  async save(dataset: Dataset): Promise<void> {
    const record = this.toSchema(dataset);
    await this.repo.save(record);
  }

  async findById(id: string): Promise<Dataset | null> {
    const record = await this.repo.findOne({ where: { id } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByCompanyId(companyId: string): Promise<Dataset[]> {
    const records = await this.repo.find({
      where: { companyId, status: 'ACTIVE' },
      order: { createdAt: 'DESC' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async update(dataset: Dataset): Promise<void> {
    await this.repo.update(dataset.id.toString(), this.toSchema(dataset));
  }

  async delete(id: string): Promise<void> {
    await this.repo.update(id, { status: 'DELETED' });
  }

  private toSchema(dataset: Dataset): DatasetSchema {
    const schema = new DatasetSchema();
    schema.id = dataset.id.toString();
    schema.companyId = dataset.companyId;
    schema.uploadedBy = dataset.uploadedBy;
    schema.name = dataset.name;
    schema.fileName = dataset.fileName;
    schema.fileSize = dataset.fileSize;
    schema.mimeType = dataset.mimeType;
    schema.columns = dataset.columns;
    schema.rowCount = dataset.rowCount;
    schema.status = dataset.status;
    return schema;
  }

  private toDomain(schema: DatasetSchema): Dataset {
    const result = Dataset.create(
      {
        companyId: schema.companyId,
        uploadedBy: schema.uploadedBy,
        name: schema.name,
        fileName: schema.fileName,
        fileSize: schema.fileSize,
        mimeType: schema.mimeType,
        columns: schema.columns,
        rowCount: schema.rowCount,
        status: schema.status as 'ACTIVE' | 'DELETED',
        createdAt: schema.createdAt,
        updatedAt: schema.updatedAt,
      },
      new UniqueEntityID(schema.id),
    );
    return result.getValue();
  }
}
