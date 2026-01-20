import { Injectable } from '@nestjs/common';
import { Result } from '../../../../../shared/core/result';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { ISurveyRepository } from '../../../domain/repositories/survey.repository.interface';
import { ISurveyVersionRepository } from '../../../domain/repositories/survey-version.repository.interface';
import { IAssessmentRepository } from '../../../domain/repositories/assessment.repository.interface';

export interface GetPendingAssessmentsRequest {
  companyId: string;
}

export interface PendingSurveyResponse {
  surveyId: string;
  title: string;
  description: string;
  hasStarted: boolean;
  progress?: number;
  assessmentId?: string;
}

export interface GetPendingAssessmentsResponse {
  pendingSurveys: PendingSurveyResponse[];
}

@Injectable()
export class GetPendingAssessmentsUseCase {
  constructor(
    private readonly surveyRepository: ISurveyRepository,
    private readonly surveyVersionRepository: ISurveyVersionRepository,
    private readonly assessmentRepository: IAssessmentRepository,
  ) {}

  async execute(request: GetPendingAssessmentsRequest): Promise<Result<GetPendingAssessmentsResponse>> {
    // 1. Validate input
    if (!request.companyId) {
      return Result.fail<GetPendingAssessmentsResponse>('Company ID is required');
    }

    const companyId = new UniqueEntityID(request.companyId);

    // 2. Get all active surveys
    const activeSurveys = await this.surveyRepository.findAll(true);

    // 3. For each survey, check if assessment exists
    const pendingSurveys: PendingSurveyResponse[] = [];

    for (const survey of activeSurveys) {
      // Get latest version
      const latestVersion = await this.surveyVersionRepository.findLatestBySurveyId(survey.id);
      
      if (!latestVersion) {
        continue; // Skip surveys without versions
      }

      // Check if assessment exists for this version
      const assessment = await this.assessmentRepository.findByCompanyAndSurveyVersion(
        companyId,
        latestVersion.id,
      );

      // Include in pending list if not completed
      if (!assessment || !assessment.status.isCompleted()) {
        pendingSurveys.push({
          surveyId: survey.id.toString(),
          title: survey.title,
          description: survey.description ?? '',
          hasStarted: !!assessment,
          progress: assessment?.finalScore,
          assessmentId: assessment?.id.toString(),
        });
      }
    }

    return Result.ok<GetPendingAssessmentsResponse>({
      pendingSurveys,
    });
  }
}
