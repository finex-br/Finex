import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { AssessmentSchema } from './assessment.schema';
import { QuestionSchema } from './question.schema';

@Entity('answers')
@Unique(['assessmentId', 'questionId'])
export class AnswerSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid', { name: 'assessment_id' })
  assessmentId: string;

  @Column('uuid', { name: 'question_id' })
  questionId: string;

  @Column('jsonb', { name: 'value_json' })
  valueJson: any;

  @Column('text', { nullable: true })
  comment: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => AssessmentSchema, (assessment) => assessment.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assessment_id' })
  assessment: AssessmentSchema;

  @ManyToOne(() => QuestionSchema, (question) => question.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: QuestionSchema;
}
