import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IDashboardRepository } from '../../../domain/ports/dashboard-repository.interface';
import { Dashboard } from '../../../domain/entities/dashboard';
import { DashboardSchema } from './dashboard.schema';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';

@Injectable()
export class TypeormDashboardRepository implements IDashboardRepository {
  constructor(
    @InjectRepository(DashboardSchema)
    private readonly repo: Repository<DashboardSchema>,
  ) {}

  async save(dashboard: Dashboard): Promise<void> {
    const record = this.toSchema(dashboard);
    await this.repo.save(record);
  }

  async findById(id: string): Promise<Dashboard | null> {
    const record = await this.repo.findOne({ where: { id } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByCompanyId(companyId: string): Promise<Dashboard[]> {
    const records = await this.repo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async update(dashboard: Dashboard): Promise<void> {
    await this.repo.update(dashboard.id.toString(), this.toSchema(dashboard));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toSchema(dashboard: Dashboard): DashboardSchema {
    const schema = new DashboardSchema();
    schema.id = dashboard.id.toString();
    schema.companyId = dashboard.companyId;
    schema.name = dashboard.name;
    schema.description = dashboard.description ?? '';
    schema.isDefault = dashboard.isDefault;
    schema.createdBy = dashboard.createdBy;
    return schema;
  }

  private toDomain(schema: DashboardSchema): Dashboard {
    const result = Dashboard.create(
      {
        companyId: schema.companyId,
        name: schema.name,
        description: schema.description || undefined,
        isDefault: schema.isDefault,
        createdBy: schema.createdBy,
        createdAt: schema.createdAt,
        updatedAt: schema.updatedAt,
      },
      new UniqueEntityID(schema.id),
    );
    return result.getValue();
  }
}
