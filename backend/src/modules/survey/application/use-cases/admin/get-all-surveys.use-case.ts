import { IUseCase } from '../../../../../shared/core/use-case.interface';
import { Result } from '../../../../../shared/core/result';
import { ISurveyRepository } from '../../../domain/repositories/survey.repository.interface';

export interface SurveyListItemDTO {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetAllSurveysResponse {
  surveys: SurveyListItemDTO[];
}

export class GetAllSurveysUseCase implements IUseCase<void, Result<GetAllSurveysResponse>> {
  constructor(private surveyRepository: ISurveyRepository) {}

  async execute(): Promise<Result<GetAllSurveysResponse>> {
    try {
      const surveys = await this.surveyRepository.findAll();

      const surveysDTO: SurveyListItemDTO[] = surveys.map((survey) => ({
        id: survey.id.toString(),
        title: survey.title,
        description: survey.description ?? '',
        isActive: survey.isActive,
        createdAt: survey.createdAt,
        updatedAt: survey.updatedAt,
      }));

      return Result.ok<GetAllSurveysResponse>({
        surveys: surveysDTO,
      });
    } catch (error) {
      return Result.fail<GetAllSurveysResponse>('Failed to fetch surveys');
    }
  }
}
