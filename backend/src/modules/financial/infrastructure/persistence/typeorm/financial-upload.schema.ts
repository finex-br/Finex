import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * FinancialUploadSchema - PostgreSQL Schema
 * 
 * Tabela existente adaptada para suportar fluxo de staging com mapeamento.
 * Status flow: UPLOADED → MAPPED → VALIDATED → PROCESSING → DONE
 */
@Entity('financial_uploads')
export class FinancialUploadSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'company_id' })
  companyId: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('varchar', { length: 255 })
  filename: string;

  @Column('varchar', { name: 'storage_path' })
  storagePath: string;

  /**
   * Status do upload:
   * - UPLOADED: Recém enviado, aguardando mapeamento pelo admin
   * - MAPPED: Admin definiu mapeamento de colunas
   * - VALIDATED: Dados validados, aguardando aprovação
   * - PROCESSING: Sendo processado e inserido em financial_data
   * - DONE: Concluído com sucesso
   * - ERROR: Erro no processamento
   * - REJECTED: Rejeitado pelo admin
   */
  @Column('varchar', { length: 50 })
  status: 'UPLOADED' | 'MAPPED' | 'VALIDATED' | 'PROCESSING' | 'DONE' | 'ERROR' | 'REJECTED';

  /**
   * Dados brutos do Excel extraídos na hora do upload
   * Estrutura: { headers: string[], rows: any[][], totalRows: number }
   */
  @Column('jsonb', { name: 'raw_data', nullable: true })
  rawData: {
    headers: string[];
    rows: any[][];
    totalRows: number;
    rowNumbers?: number[];
  } | null;

  /**
   * Mapeamento de colunas definido pelo admin
   * Estrutura: { date: "Data", description: "Descrição", ... }
   */
  @Column('jsonb', { name: 'column_mapping', nullable: true })
  columnMapping: {
    date?: string;
    description?: string;
    category?: string;
    amount?: string;
    type?: string;
  } | null;

  /**
   * Resultado da validação (erros, warnings, estatísticas)
   */
  @Column('jsonb', { name: 'validation_result', nullable: true })
  validationResult: {
    isValid: boolean;
    errors: Array<{ row: number; field: string; message: string }>;
    warnings: Array<{ row: number; field: string; message: string }>;
    validTransactions: number;
    invalidTransactions: number;
  } | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
