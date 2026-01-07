import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { SurveyVersionSchema } from './survey-version.schema';
import { AnswerSchema } from './answer.schema';

@Entity('questions')
export class QuestionSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid', { name: 'survey_version_id' })
  surveyVersionId: string;

  @Column('text')
  text: string;

  @Column('varchar')
  type: string;

  @Column('jsonb', { nullable: true })
  options: string[] | null;

  @Column('int', { name: 'order_index' })
  orderIndex: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => SurveyVersionSchema, (version) => version.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'survey_version_id' })
  surveyVersion: SurveyVersionSchema;

  @OneToMany(() => AnswerSchema, (answer) => answer.question)
  answers: AnswerSchema[];
}
