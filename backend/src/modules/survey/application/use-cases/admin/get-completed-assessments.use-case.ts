import { IUseCase } from '../../../../../shared/core/use-case.interface';
import { Result } from '../../../../../shared/core/result';
import { IAssessmentRepository } from '../../../domain/repositories/assessment.repository.interface';
import { ISurveyRepository } from '../../../domain/repositories/survey.repository.interface';
import { ISurveyVersionRepository } from '../../../domain/repositories/survey-version.repository.interface';
import { ICompanyRepository } from '../../../../../shared/domain/repositories/company-repository.interface';

export interface GetCompletedAssessmentsRequest {
  companyId?: string;
  surveyId?: string;
}

export interface CompletedAssessmentDTO {
  id: string;
  companyId: string;
  companyName: string;
  surveyId: string;
  surveyTitle: string;
  progress: number;
  completedAt: Date;
  status: string;
}

export interface GetCompletedAssessmentsResponse {
  assessments: CompletedAssessmentDTO[];
}

export class GetCompletedAssessmentsUseCase
  implements IUseCase<GetCompletedAssessmentsRequest, Result<GetCompletedAssessmentsResponse>>
{
  constructor(
    private assessmentRepository: IAssessmentRepository,
    private surveyRepository: ISurveyRepository,
    private surveyVersionRepository: ISurveyVersionRepository,
    private companyRepository: ICompanyRepository,
  ) {}

  async execute(
    request: GetCompletedAssessmentsRequest,
  ): Promise<Result<GetCompletedAssessmentsResponse>> {
    try {
      // Get all assessments with filters
      const assessments = await this.assessmentRepository.findAll({
        companyId: request.companyId,
        surveyId: request.surveyId,
        status: 'COMPLETED',
      });

      // Map to DTOs
      const assessmentsDTO: CompletedAssessmentDTO[] = await Promise.all(
        assessments.map(async (assessment) => {
          // Get survey version and then survey info
          const surveyVersion = await this.surveyVersionRepository.findById(
            assessment.surveyVersionId,
          );
          const survey = surveyVersion
            ? await this.surveyRepository.findById(surveyVersion.surveyId)
            : null;

          // Get company info
          const company = await this.companyRepository.findById(assessment.companyId);

          return {
            id: assessment.id.toString(),
            companyId: assessment.companyId.toString(),
            companyName: company?.name || 'N/A',
            surveyId: survey?.id.toString() || 'N/A',
            surveyTitle: survey?.title || 'N/A',
            progress: assessment.finalScore,
            completedAt: assessment.updatedAt,
            status: assessment.status.value,
          };
        }),
      );

      // Sort by completion date (most recent first)
      assessmentsDTO.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

      return Result.ok<GetCompletedAssessmentsResponse>({
        assessments: assessmentsDTO,
      });
    } catch (error) {
      return Result.fail<GetCompletedAssessmentsResponse>('Failed to fetch completed assessments');
    }
  }
}
