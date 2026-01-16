import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../../../domain/entities/company.entity';
import { ICompanyRepository } from '../../../../domain/repositories/company-repository.interface';
import { UniqueEntityID } from '../../../../core/unique-entity-id';
import { CNPJ } from '../../../../domain/value-objects/cnpj';
import { CompanySchema } from '../entities/company.schema';
import { CompanyMemberSchema } from '../entities/company-member.schema';

@Injectable()
export class CompanyRepository implements ICompanyRepository {
  constructor(
    @InjectRepository(CompanySchema)
    private readonly companyRepo: Repository<CompanySchema>,
    @InjectRepository(CompanyMemberSchema)
    private readonly memberRepo: Repository<CompanyMemberSchema>,
  ) {}

  async save(company: Company): Promise<void> {
    const schema = new CompanySchema();
    schema.id = company.id.toString();
    schema.name = company.name;
    schema.cnpj = company.cnpj?.value; // Extract string value from CNPJ value object
    schema.sector = company.sector;
    schema.createdAt = company.createdAt;
    schema.updatedAt = company.updatedAt;

    await this.companyRepo.save(schema);
  }

  async findById(id: UniqueEntityID): Promise<Company | null> {
    const schema = await this.companyRepo.findOne({
      where: { id: id.toString() },
    });

    if (!schema) {
      return null;
    }

    return this.toDomain(schema);
  }

  async findByUserId(userId: UniqueEntityID): Promise<Company | null> {
    // Find active company member for this user
    const member = await this.memberRepo.findOne({
      where: {
        userId: userId.toString(),
        isActive: true,
      },
    });

    if (!member) {
      return null;
    }

    // Get the company
    return this.findById(new UniqueEntityID(member.companyId));
  }

  async findByCnpj(cnpj: string): Promise<Company | null> {
    const schema = await this.companyRepo.findOne({
      where: { cnpj },
    });

    if (!schema) {
      return null;
    }

    return this.toDomain(schema);
  }

  private toDomain(schema: CompanySchema): Company {
    // Convert CNPJ string to CNPJ value object if present
    let cnpjValueObject: CNPJ | undefined;
    if (schema.cnpj) {
      const cnpjOrError = CNPJ.create(schema.cnpj);
      if (cnpjOrError.isFailure) {
        throw new Error(`Invalid CNPJ in database: ${cnpjOrError.error}`);
      }
      cnpjValueObject = cnpjOrError.getValue();
    }

    const companyOrError = Company.create(
      {
        name: schema.name,
        cnpj: cnpjValueObject,
        sector: schema.sector,
        createdAt: schema.createdAt,
        updatedAt: schema.updatedAt,
      },
      new UniqueEntityID(schema.id),
    );

    if (companyOrError.isFailure) {
      throw new Error(companyOrError.error!);
    }

    return companyOrError.getValue();
  }
}
