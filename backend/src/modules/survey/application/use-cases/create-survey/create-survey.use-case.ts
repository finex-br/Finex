import { Injectable } from '@nestjs/common';
import { Result } from '../../../../../shared/core/result';
import { Survey } from '../../../domain/entities/survey.entity';
import { ISurveyRepository } from '../../../domain/repositories/survey.repository.interface';

export interface CreateSurveyRequest {
  title: string;
  description: string;
}

export interface CreateSurveyResponse {
  surveyId: string;
}

@Injectable()
export class CreateSurveyUseCase {
  constructor(private readonly surveyRepository: ISurveyRepository) {}

  async execute(request: CreateSurveyRequest): Promise<Result<CreateSurveyResponse>> {
    // Validate input
    if (!request.title || request.title.trim().length === 0) {
      return Result.fail<CreateSurveyResponse>('Title is required');
    }

    if (!request.description || request.description.trim().length === 0) {
      return Result.fail<CreateSurveyResponse>('Description is required');
    }

    // Create survey entity
    const surveyOrError = Survey.create({
      title: request.title,
      description: request.description,
      isActive: true,
    });

    if (surveyOrError.isFailure) {
      return Result.fail<CreateSurveyResponse>(surveyOrError.error || 'Failed to create survey');
    }

    const survey = surveyOrError.getValue();

    // Persist
    await this.surveyRepository.save(survey);

    return Result.ok<CreateSurveyResponse>({
      surveyId: survey.id.toString(),
    });
  }
}
