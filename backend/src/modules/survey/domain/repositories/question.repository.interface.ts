import { Question } from '../entities/question.entity';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';

export interface IQuestionRepository {
  save(question: Question): Promise<void>;
  saveMany(questions: Question[]): Promise<void>;
  findById(id: UniqueEntityID): Promise<Question | null>;
  findBySurveyVersionId(surveyVersionId: UniqueEntityID): Promise<Question[]>;
  countBySurveyVersionId(surveyVersionId: UniqueEntityID): Promise<number>;
}
