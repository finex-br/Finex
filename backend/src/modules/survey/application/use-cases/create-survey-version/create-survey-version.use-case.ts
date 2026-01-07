import { Injectable } from '@nestjs/common';
import { Result } from '../../../../../shared/core/result';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { SurveyVersion } from '../../../domain/entities/survey-version.entity';
import { ISurveyVersionRepository } from '../../../domain/repositories/survey-version.repository.interface';
import { ISurveyRepository } from '../../../domain/repositories/survey.repository.interface';
import { IQuestionRepository } from '../../../domain/repositories/question.repository.interface';
import { Question } from '../../../domain/entities/question.entity';
import { QuestionType } from '../../../domain/value-objects/question-type.vo';
import { DropdownOptions } from '../../../domain/value-objects/dropdown-options.vo';

export interface QuestionInput {
  text: string;
  type: string;
  options?: string[];
  orderIndex: number;
}

export interface CreateSurveyVersionRequest {
  surveyId: string;
  effectiveDate?: Date;
  questions: QuestionInput[];
}

export interface CreateSurveyVersionResponse {
  versionId: string;
  versionNumber: number;
  questionCount: number;
}

@Injectable()
export class CreateSurveyVersionUseCase {
  constructor(
    private readonly surveyRepository: ISurveyRepository,
    private readonly surveyVersionRepository: ISurveyVersionRepository,
    private readonly questionRepository: IQuestionRepository,
  ) {}

  async execute(request: CreateSurveyVersionRequest): Promise<Result<CreateSurveyVersionResponse>> {
    // 1. Validate input
    if (!request.surveyId) {
      return Result.fail<CreateSurveyVersionResponse>('Survey ID is required');
    }

    if (!request.questions || request.questions.length === 0) {
      return Result.fail<CreateSurveyVersionResponse>('At least one question is required');
    }

    const surveyId = new UniqueEntityID(request.surveyId);

    // 2. Verify survey exists
    const survey = await this.surveyRepository.findById(surveyId);
    if (!survey) {
      return Result.fail<CreateSurveyVersionResponse>('Survey not found');
    }

    // 3. Get next version number
    const latestVersion = await this.surveyVersionRepository.findLatestBySurveyId(surveyId);
    const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // 4. Create survey version
    const versionOrError = SurveyVersion.create({
      surveyId,
      versionNumber: nextVersionNumber,
      effectiveDate: request.effectiveDate || new Date(),
    });

    if (versionOrError.isFailure) {
      return Result.fail<CreateSurveyVersionResponse>(versionOrError.error || 'Failed to create version');
    }

    const version = versionOrError.getValue();
    await this.surveyVersionRepository.save(version);

    // 5. Create questions
    const questions: Question[] = [];

    for (const questionInput of request.questions) {
      // Validate question type
      const questionTypeOrError = QuestionType.create(questionInput.type);
      if (questionTypeOrError.isFailure) {
        return Result.fail<CreateSurveyVersionResponse>(
          `Invalid question type: ${questionTypeOrError.error}`
        );
      }

      const questionType = questionTypeOrError.getValue();

      // Create question options if provided
      let questionOptions: DropdownOptions | undefined;
      if (questionInput.options && questionInput.options.length > 0) {
        const optionsOrError = DropdownOptions.create(questionInput.options);
        if (optionsOrError.isFailure) {
          return Result.fail<CreateSurveyVersionResponse>(
            `Invalid question options: ${optionsOrError.error}`
          );
        }
        questionOptions = optionsOrError.getValue();
      }

      // Create question
      const questionOrError = Question.create({
        surveyVersionId: version.id,
        text: questionInput.text,
        type: questionType,
        options: questionOptions,
        orderIndex: questionInput.orderIndex,
      });

      if (questionOrError.isFailure) {
        return Result.fail<CreateSurveyVersionResponse>(
          `Failed to create question: ${questionOrError.error}`
        );
      }

      questions.push(questionOrError.getValue());
    }

    // 6. Save all questions
    await this.questionRepository.saveMany(questions);

    return Result.ok<CreateSurveyVersionResponse>({
      versionId: version.id.toString(),
      versionNumber: version.versionNumber,
      questionCount: questions.length,
    });
  }
}
