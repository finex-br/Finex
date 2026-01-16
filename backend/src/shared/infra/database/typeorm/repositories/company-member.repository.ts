import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyMember } from '../../../../domain/entities/company-member.entity';
import { ICompanyMemberRepository } from '../../../../domain/repositories/company-member-repository.interface';
import { UniqueEntityID } from '../../../../core/unique-entity-id';
import { CompanyMemberSchema } from '../entities/company-member.schema';

@Injectable()
export class CompanyMemberRepository implements ICompanyMemberRepository {
  constructor(
    @InjectRepository(CompanyMemberSchema)
    private readonly repo: Repository<CompanyMemberSchema>,
  ) {}

  async save(member: CompanyMember): Promise<void> {
    const schema = new CompanyMemberSchema();
    schema.id = member.id.toString();
    schema.userId = member.userId.toString();
    schema.companyId = member.companyId.toString();
    schema.role = member.role;
    schema.isActive = member.isActive;
    schema.createdAt = member.createdAt;
    schema.updatedAt = member.updatedAt;

    await this.repo.save(schema);
  }

  async findByUserAndCompany(
    userId: UniqueEntityID,
    companyId: UniqueEntityID,
  ): Promise<CompanyMember | null> {
    const schema = await this.repo.findOne({
      where: {
        userId: userId.toString(),
        companyId: companyId.toString(),
      },
    });

    if (!schema) {
      return null;
    }

    return this.toDomain(schema);
  }

  async findActiveByUserId(userId: UniqueEntityID): Promise<CompanyMember | null> {
    const schema = await this.repo.findOne({
      where: {
        userId: userId.toString(),
        isActive: true,
      },
    });

    if (!schema) {
      return null;
    }

    return this.toDomain(schema);
  }

  private toDomain(schema: CompanyMemberSchema): CompanyMember {
    const memberOrError = CompanyMember.create(
      {
        userId: new UniqueEntityID(schema.userId),
        companyId: new UniqueEntityID(schema.companyId),
        role: schema.role as 'OWNER' | 'VIEWER',
        isActive: schema.isActive,
        createdAt: schema.createdAt,
        updatedAt: schema.updatedAt,
      },
      new UniqueEntityID(schema.id),
    );

    if (memberOrError.isFailure) {
      throw new Error(memberOrError.error!);
    }

    return memberOrError.getValue();
  }
}
