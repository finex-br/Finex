import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * FinancialDataSchema - TypeORM Entity
 *
 * Representa a tabela financial_data no PostgreSQL (fonte de verdade do dashboard).
 */
@Entity('financial_data')
export class FinancialDataSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid' })
  @Index()
  companyId: string;

  @Column({ name: 'upload_id', type: 'uuid', nullable: true })
  uploadId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: string;

  @Column({ name: 'date_competence', type: 'date', nullable: true })
  dateCompetence: string | null;

  @Column({ name: 'date_payment', type: 'date', nullable: true })
  datePayment: string | null;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  /**
   * Operational metadata (JSONB) for business-specific metrics
   * Example for vending machines:
   * {
   *   deviceId: "Kombi_Mushspresso",
   *   blend: "qCafe1",
   *   nivelGalao: 75,
   *   salesCount: 1,
   *   hash: "abc123"
   * }
   */
  @Column({ type: 'jsonb', name: 'operational_metadata', nullable: true })
  operationalMetadata: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
