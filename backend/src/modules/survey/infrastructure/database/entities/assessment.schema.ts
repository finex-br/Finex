import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { SurveyVersionSchema } from './survey-version.schema';
import { AnswerSchema } from './answer.schema';

@Entity('assessments')
@Unique(['companyId', 'surveyVersionId'])
export class AssessmentSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid', { name: 'company_id' })
  companyId: string;

  @Column('uuid', { name: 'survey_version_id' })
  surveyVersionId: string;

  @Column('varchar')
  status: string;

  @Column('decimal', { name: 'final_score', precision: 5, scale: 2, default: 0 })
  finalScore: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => SurveyVersionSchema, (version) => version.assessments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'survey_version_id' })
  surveyVersion: SurveyVersionSchema;

  @OneToMany(() => AnswerSchema, (answer) => answer.assessment)
  answers: AnswerSchema[];
}
