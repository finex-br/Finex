import { Dataset } from '../entities/dataset';

export interface IDatasetRepository {
  save(dataset: Dataset): Promise<void>;
  findById(id: string): Promise<Dataset | null>;
  findByCompanyId(companyId: string): Promise<Dataset[]>;
  update(dataset: Dataset): Promise<void>;
  delete(id: string): Promise<void>;
}
