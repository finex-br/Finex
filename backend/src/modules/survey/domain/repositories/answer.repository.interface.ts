import { Answer } from '../entities/answer.entity';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';

export interface IAnswerRepository {
  save(answer: Answer): Promise<void>;
  saveMany(answers: Answer[]): Promise<void>;
  findById(id: UniqueEntityID): Promise<Answer | null>;
  findByAssessmentId(assessmentId: UniqueEntityID): Promise<Answer[]>;
  findByAssessmentAndQuestion(
    assessmentId: UniqueEntityID,
    questionId: UniqueEntityID,
  ): Promise<Answer | null>;
  countByAssessmentId(assessmentId: UniqueEntityID): Promise<number>;
  deleteByAssessmentId(assessmentId: UniqueEntityID): Promise<void>;
}
