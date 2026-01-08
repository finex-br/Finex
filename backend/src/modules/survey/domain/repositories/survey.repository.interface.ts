import { Survey } from '../entities/survey.entity';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';

export interface ISurveyRepository {
  save(survey: Survey): Promise<void>;
  findById(id: UniqueEntityID): Promise<Survey | null>;
  findAll(isActive?: boolean): Promise<Survey[]>;
  exists(id: UniqueEntityID): Promise<boolean>;
  delete(id: UniqueEntityID): Promise<void>;
}
