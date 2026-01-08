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

  @Column('text')
  description: string;

  @Column('boolean', { name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => SurveyVersionSchema, (version) => version.survey)
  versions: SurveyVersionSchema[];
}
