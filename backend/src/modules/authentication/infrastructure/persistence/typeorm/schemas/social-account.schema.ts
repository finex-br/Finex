import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserSchema } from '../entities/user.schema';

@Entity('social_accounts')
export class SocialAccountSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column({ type: 'varchar', length: 20 })
  provider: string;

  @Column({ type: 'varchar', length: 255 })
  providerId: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  displayName: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserSchema, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserSchema;
}
