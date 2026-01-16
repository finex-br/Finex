import { Company } from '../entities/company.entity';
import { UniqueEntityID } from '../../core/unique-entity-id';

export interface ICompanyRepository {
  save(company: Company): Promise<void>;
  findById(id: UniqueEntityID): Promise<Company | null>;
  findByUserId(userId: UniqueEntityID): Promise<Company | null>;
  findByCnpj(cnpj: string): Promise<Company | null>;
}
