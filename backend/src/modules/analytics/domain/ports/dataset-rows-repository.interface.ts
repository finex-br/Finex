export interface DatasetRow {
  id?: string;
  datasetId: string;
  companyId: string;
  rowIndex: number;
  rowData: Record<string, any>;
}

export interface IDatasetRowsRepository {
  insertBatch(rows: DatasetRow[]): Promise<void>;
  findByDatasetId(datasetId: string, limit?: number, offset?: number): Promise<DatasetRow[]>;
  deleteByDatasetId(datasetId: string): Promise<void>;
  countByDatasetId(datasetId: string): Promise<number>;
}
