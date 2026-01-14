import { CompanyMember } from '../entities/company-member.entity';
import { UniqueEntityID } from '../../core/unique-entity-id';

export interface ICompanyMemberRepository {
  save(member: CompanyMember): Promise<void>;
  findByUserAndCompany(
    userId: UniqueEntityID,
    companyId: UniqueEntityID,
  ): Promise<CompanyMember | null>;
  findActiveByUserId(userId: UniqueEntityID): Promise<CompanyMember | null>;
}
