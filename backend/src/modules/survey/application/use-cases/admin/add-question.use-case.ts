import { IUseCase } from '../../../../../shared/core/use-case.interface';
import { Result } from '../../../../../shared/core/result';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { IQuestionRepository } from '../../../domain/repositories/question.repository.interface';
import { ISurveyVersionRepository } from '../../../domain/repositories/survey-version.repository.interface';
import { Question } from '../../../domain/entities/question.entity';
import { QuestionType } from '../../../domain/value-objects/question-type.vo';
import { DropdownOptions } from '../../../domain/value-objects/dropdown-options.vo';
import { AddQuestionDTO } from '../../dtos/admin/add-question.dto';
import { QuestionResponseDTO } from '../../dtos/admin/question-response.dto';

export class AddQuestionUseCase implements IUseCase<AddQuestionDTO, Result<QuestionResponseDTO>> {
  constructor(
    private questionRepository: IQuestionRepository,
    private surveyVersionRepository: ISurveyVersionRepository,
  ) {}

  async execute(request: AddQuestionDTO): Promise<Result<QuestionResponseDTO>> {
    // Validate survey version exists
    const surveyVersion = await this.surveyVersionRepository.findById(
      new UniqueEntityID(request.surveyVersionId)
    );

    if (!surveyVersion) {
      return Result.fail<QuestionResponseDTO>('Survey version not found');
    }

    // Validate question text
    if (!request.text || request.text.trim().length === 0) {
      return Result.fail<QuestionResponseDTO>('Question text is required');
    }

    // Validate question type
    const questionTypeOrError = QuestionType.create(request.type);
    if (questionTypeOrError.isFailure) {
      return Result.fail<QuestionResponseDTO>(questionTypeOrError.error!);
    }

    const questionType = questionTypeOrError.getValue();

    // Validate DROPDOWN options
    if (questionType.isDropdown()) {
      if (!request.options || request.options.length === 0) {
        return Result.fail<QuestionResponseDTO>(
          'DROPDOWN questions must have options'
        );
      }

      if (request.options.length < 2) {
        return Result.fail<QuestionResponseDTO>(
          'DROPDOWN questions must have at least 2 options'
        );
      }
    }

    // Validate orderIndex
    if (request.orderIndex < 0) {
      return Result.fail<QuestionResponseDTO>('orderIndex must be non-negative');
    }

    // Convert options to DropdownOptions value object if needed
    let dropdownOptions: DropdownOptions | null = null;
    if (questionType.isDropdown() && request.options) {
      const optionsOrError = DropdownOptions.create(request.options);
      if (optionsOrError.isFailure) {
        return Result.fail<QuestionResponseDTO>(optionsOrError.error!);
      }
      dropdownOptions = optionsOrError.getValue();
    }

    // Create question entity
    const questionOrError = Question.create({
      surveyVersionId: surveyVersion.id,
      text: request.text.trim(),
      type: questionType,
      options: dropdownOptions,
      orderIndex: request.orderIndex,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (questionOrError.isFailure) {
      return Result.fail<QuestionResponseDTO>(questionOrError.error!);
    }

    const question = questionOrError.getValue();

    // Save question
    await this.questionRepository.save(question);

    // Return response
    const response: QuestionResponseDTO = {
      id: question.id.toString(),
      surveyVersionId: question.surveyVersionId.toString(),
      text: question.text,
      type: question.type.value,
      options: question.options?.options,
      orderIndex: question.orderIndex,
      createdAt: question.createdAt,
    };

    return Result.ok<QuestionResponseDTO>(response);
  }
}
