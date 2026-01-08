import { SurveyVersion } from '../entities/survey-version.entity';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';

export interface ISurveyVersionRepository {
  save(version: SurveyVersion): Promise<void>;
  findById(id: UniqueEntityID): Promise<SurveyVersion | null>;
  findBySurveyId(surveyId: UniqueEntityID): Promise<SurveyVersion[]>;
  findLatestBySurveyId(surveyId: UniqueEntityID): Promise<SurveyVersion | null>;
  exists(id: UniqueEntityID): Promise<boolean>;
}
