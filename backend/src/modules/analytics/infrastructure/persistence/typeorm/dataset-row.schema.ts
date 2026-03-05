import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('dataset_rows')
@Index(['datasetId'])
@Index(['companyId'])
export class DatasetRowSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'dataset_id', type: 'uuid' })
  datasetId: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'row_index', type: 'int' })
  rowIndex: number;

  @Column({ name: 'row_data', type: 'jsonb' })
  rowData: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
