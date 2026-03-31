import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IChartConfigRepository } from '../../../domain/ports/chart-config-repository.interface';
import { ChartConfig } from '../../../domain/entities/chart-config';
import { ChartConfigSchema } from './chart-config.schema';
import { ChartType } from '../../../domain/value-objects/chart-type';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';

@Injectable()
export class TypeormChartConfigRepository implements IChartConfigRepository {
  constructor(
    @InjectRepository(ChartConfigSchema)
    private readonly repo: Repository<ChartConfigSchema>,
  ) {}

  async save(chart: ChartConfig): Promise<void> {
    const record = this.toSchema(chart);
    await this.repo.save(record);
  }

  async findById(id: string): Promise<ChartConfig | null> {
    const record = await this.repo.findOne({ where: { id } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByDashboardId(dashboardId: string): Promise<ChartConfig[]> {
    const records = await this.repo.find({
      where: { dashboardId },
      order: { displayOrder: 'ASC' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async update(chart: ChartConfig): Promise<void> {
    await this.repo.update(chart.id.toString(), this.toSchema(chart));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toSchema(chart: ChartConfig): ChartConfigSchema {
    const schema = new ChartConfigSchema();
    schema.id = chart.id.toString();
    schema.dashboardId = chart.dashboardId;
    schema.companyId = chart.companyId;
    schema.name = chart.name;
    schema.chartType = chart.chartType.value;
    schema.dataSource = chart.dataSource;
    schema.visualConfig = chart.visualConfig;
    schema.position = chart.position;
    schema.displayOrder = chart.displayOrder;
    return schema;
  }

  private toDomain(schema: ChartConfigSchema): ChartConfig {
    const chartTypeResult = ChartType.create(schema.chartType);
    const result = ChartConfig.create(
      {
        dashboardId: schema.dashboardId,
        companyId: schema.companyId,
        name: schema.name,
        chartType: chartTypeResult.getValue(),
        dataSource: schema.dataSource,
        visualConfig: schema.visualConfig,
        position: schema.position,
        displayOrder: schema.displayOrder,
        createdAt: schema.createdAt,
        updatedAt: schema.updatedAt,
      },
      new UniqueEntityID(schema.id),
    );
    return result.getValue();
  }
}
