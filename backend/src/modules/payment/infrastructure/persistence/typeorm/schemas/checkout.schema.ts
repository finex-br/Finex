import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('checkouts')
export class CheckoutSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('varchar', { length: 500 })
  description: string;

  @Column('varchar', { length: 50 })
  status: string;

  @Column('varchar', { length: 255, nullable: true })
  asaasCheckoutId?: string;

  @Column('varchar', { length: 255, nullable: true })
  asaasPaymentId?: string;

  @Column('text', { nullable: true })
  checkoutUrl?: string;

  @Column('int', { nullable: true })
  maxInstallments?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('timestamp', { nullable: true })
  paidAt?: Date;

  @Column('timestamp', { nullable: true })
  expiresAt?: Date;
}
