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
import { SurveySchema } from './survey.schema';
import { QuestionSchema } from './question.schema';
import { AssessmentSchema } from './assessment.schema';

@Entity('survey_versions')
@Unique(['surveyId', 'versionNumber'])
export class SurveyVersionSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid', { name: 'survey_id' })
  surveyId: string;

  @Column('int', { name: 'version_number' })
  versionNumber: number;

  @Column('timestamp', { name: 'effective_date' })
  effectiveDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => SurveySchema, (survey) => survey.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'survey_id' })
  survey: SurveySchema;

  @OneToMany(() => QuestionSchema, (question) => question.surveyVersion)
  questions: QuestionSchema[];

  @OneToMany(() => AssessmentSchema, (assessment) => assessment.surveyVersion)
  assessments: AssessmentSchema[];
}
