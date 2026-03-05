import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IDatasetRowsRepository,
  DatasetRow,
} from '../../../domain/ports/dataset-rows-repository.interface';
import { DatasetRowSchema } from './dataset-row.schema';

@Injectable()
export class TypeormDatasetRowsRepository implements IDatasetRowsRepository {
  constructor(
    @InjectRepository(DatasetRowSchema)
    private readonly repo: Repository<DatasetRowSchema>,
  ) {}

  async insertBatch(rows: DatasetRow[]): Promise<void> {
    const BATCH_SIZE = 500;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const entities = batch.map((row) => {
        const entity = new DatasetRowSchema();
        entity.datasetId = row.datasetId;
        entity.companyId = row.companyId;
        entity.rowIndex = row.rowIndex;
        entity.rowData = row.rowData;
        return entity;
      });
      await this.repo.save(entities);
    }
  }

  async findByDatasetId(
    datasetId: string,
    limit = 100,
    offset = 0,
  ): Promise<DatasetRow[]> {
    const records = await this.repo.find({
      where: { datasetId },
      order: { rowIndex: 'ASC' },
      take: limit,
      skip: offset,
    });
    return records.map((r) => ({
      id: r.id,
      datasetId: r.datasetId,
      companyId: r.companyId,
      rowIndex: r.rowIndex,
      rowData: r.rowData,
    }));
  }

  async deleteByDatasetId(datasetId: string): Promise<void> {
    await this.repo.delete({ datasetId });
  }

  async countByDatasetId(datasetId: string): Promise<number> {
    return this.repo.count({ where: { datasetId } });
  }
}
