import { Assessment } from '../entities/assessment.entity';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';

export interface IAssessmentRepository {
  save(assessment: Assessment): Promise<void>;
  findById(id: UniqueEntityID): Promise<Assessment | null>;
  findByCompanyAndSurveyVersion(
    companyId: UniqueEntityID,
    surveyVersionId: UniqueEntityID,
  ): Promise<Assessment | null>;
  findByCompanyId(companyId: UniqueEntityID): Promise<Assessment[]>;
  findAll(filters?: { companyId?: string; surveyId?: string; status?: string }): Promise<Assessment[]>;
  exists(companyId: UniqueEntityID, surveyVersionId: UniqueEntityID): Promise<boolean>;
}
