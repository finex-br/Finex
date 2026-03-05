import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SurveyVersionSchema } from './survey-version.schema';

@Entity('surveys')
export class SurveySchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column('varchar')
  title: string;

  @Column('text', { nullable: true })
  description?: string | null;

  @Column('boolean', { name: 'is_active', default: true })
  isActive: boolean;

  @Column('int', { name: 'estimated_time_minutes', default: 2 })
  estimatedTimeMinutes: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => SurveyVersionSchema, (version) => version.survey)
  versions: SurveyVersionSchema[];
}
