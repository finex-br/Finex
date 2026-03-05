import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('datasets')
@Index(['companyId'])
export class DatasetSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'uploaded_by', type: 'uuid' })
  uploadedBy: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName: string;

  @Column({ name: 'file_size', type: 'int', nullable: true })
  fileSize: number;

  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: true })
  mimeType: string;

  @Column({ type: 'jsonb' })
  columns: any;

  @Column({ name: 'row_count', type: 'int' })
  rowCount: number;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVE' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
