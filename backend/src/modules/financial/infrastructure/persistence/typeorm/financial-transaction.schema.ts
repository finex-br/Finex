import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * FinancialTransactionSchema - TypeORM Entity
 * 
 * Representa a tabela financial_transactions no PostgreSQL.
 * Separação limpa: Domain Entity (FinancialTransaction) vs Persistence Entity (Schema).
 */
@Entity('financial_transactions')
@Index(['companyId', 'date']) // Otimiza queries por empresa e período
export class FinancialTransactionSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, name: 'company_id' })
  @Index()
  companyId: string;

  @Column({ type: 'timestamp' })
  @Index()
  date: Date;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  // Money Value Object - Armazena como numeric para precisão
  // Transformer garante que PostgreSQL decimal seja convertido para number
  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    name: 'amount_value',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  amountValue: number;

  @Column({ type: 'varchar', length: 3, name: 'amount_currency', default: 'BRL' })
  amountCurrency: string;

  // TransactionType Value Object
  @Column({ type: 'varchar', length: 20 })
  type: string; // 'RECEITA' ou 'DESPESA'

  // Category Value Object
  @Column({ type: 'varchar', length: 100, name: 'category_name' })
  categoryName: string;

  @Column({ type: 'timestamp', nullable: true, name: 'competence_date' })
  competenceDate: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'payment_date' })
  paymentDate: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
