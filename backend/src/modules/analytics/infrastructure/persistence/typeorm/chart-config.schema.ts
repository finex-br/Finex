import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('chart_configs')
@Index(['dashboardId'])
@Index(['companyId'])
export class ChartConfigSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'dashboard_id', type: 'uuid' })
  dashboardId: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'chart_type', type: 'varchar', length: 50 })
  chartType: string;

  @Column({ name: 'data_source', type: 'jsonb' })
  dataSource: any;

  @Column({ name: 'visual_config', type: 'jsonb' })
  visualConfig: any;

  @Column({ type: 'jsonb', default: '{"x":0,"y":0,"width":6,"height":4}' })
  position: any;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
