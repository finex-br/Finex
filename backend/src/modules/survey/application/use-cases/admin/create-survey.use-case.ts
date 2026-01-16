import { IUseCase } from '../../../../../shared/core/use-case.interface';
import { Result } from '../../../../../shared/core/result';
import { ISurveyRepository } from '../../../domain/repositories/survey.repository.interface';
import { ISurveyVersionRepository } from '../../../domain/repositories/survey-version.repository.interface';
import { Survey } from '../../../domain/entities/survey.entity';
import { SurveyVersion } from '../../../domain/entities/survey-version.entity';
import { CreateSurveyDTO } from '../../dtos/admin/create-survey.dto';
import { SurveyResponseDTO } from '../../dtos/admin/survey-response.dto';

export class CreateSurveyUseCase implements IUseCase<CreateSurveyDTO, Result<SurveyResponseDTO>> {
  constructor(
    private surveyRepository: ISurveyRepository,
    private surveyVersionRepository: ISurveyVersionRepository,
  ) {}

  async execute(request: CreateSurveyDTO): Promise<Result<SurveyResponseDTO>> {
    // Validate title
    if (!request.title || request.title.trim().length === 0) {
      return Result.fail<SurveyResponseDTO>('Survey title is required');
    }

    if (request.title.trim().length < 3) {
      return Result.fail<SurveyResponseDTO>('Survey title must have at least 3 characters');
    }

    // Create survey entity
    const surveyOrError = Survey.create({
      title: request.title.trim(),
      description: request.description?.trim() || undefined,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (surveyOrError.isFailure) {
      return Result.fail<SurveyResponseDTO>(surveyOrError.error!);
    }

    const survey = surveyOrError.getValue();

    // Save survey
    await this.surveyRepository.save(survey);

    // Create first version
    const versionOrError = SurveyVersion.create({
      surveyId: survey.id,
      versionNumber: 1,
      effectiveDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (versionOrError.isFailure) {
      return Result.fail<SurveyResponseDTO>(versionOrError.error!);
    }

    const version = versionOrError.getValue();

    // Save version
    await this.surveyVersionRepository.save(version);

    // Return response
    const response: SurveyResponseDTO = {
      id: survey.id.toString(),
      title: survey.title,
      description: survey.description,
      isActive: survey.isActive,
      versionId: version.id.toString(),
      versionNumber: version.versionNumber,
      createdAt: survey.createdAt,
    };

    return Result.ok<SurveyResponseDTO>(response);
  }
}
