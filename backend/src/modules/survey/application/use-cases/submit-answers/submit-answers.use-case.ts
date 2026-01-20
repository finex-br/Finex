import { Injectable } from '@nestjs/common';
import { Result } from '../../../../../shared/core/result';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { IAssessmentRepository } from '../../../domain/repositories/assessment.repository.interface';
import { IQuestionRepository } from '../../../domain/repositories/question.repository.interface';
import { IAnswerRepository } from '../../../domain/repositories/answer.repository.interface';
import { Answer } from '../../../domain/entities/answer.entity';
import { AnswerValue } from '../../../domain/value-objects/answer-value.vo';
import { QuestionTypeEnum } from '../../../domain/value-objects/question-type.vo';

export interface AnswerInput {
  questionId: string;
  value: any;
  comment?: string;
}

export interface SubmitAnswersRequest {
  assessmentId: string;
  companyId: string;
  answers: AnswerInput[];
}

export interface SubmitAnswersResponse {
  success: boolean;
  progress: number;
  isCompleted: boolean;
}

@Injectable()
export class SubmitAnswersUseCase {
  constructor(
    private readonly assessmentRepository: IAssessmentRepository,
    private readonly questionRepository: IQuestionRepository,
    private readonly answerRepository: IAnswerRepository,
  ) {}

  async execute(request: SubmitAnswersRequest): Promise<Result<SubmitAnswersResponse>> {
    // 1. Validate input
    if (!request.assessmentId) {
      return Result.fail<SubmitAnswersResponse>('Assessment ID is required');
    }

    if (!request.companyId) {
      return Result.fail<SubmitAnswersResponse>('Company ID is required');
    }

    if (!request.answers || request.answers.length === 0) {
      return Result.fail<SubmitAnswersResponse>('At least one answer is required');
    }

    const assessmentId = new UniqueEntityID(request.assessmentId);
    const companyId = new UniqueEntityID(request.companyId);

    // 2. Get assessment
    const assessment = await this.assessmentRepository.findByIdAndCompany(assessmentId, companyId);
    if (!assessment) {
      return Result.fail<SubmitAnswersResponse>('Assessment not found');
    }

    // 3. Check if assessment is completed
    if (assessment.status.isCompleted()) {
      return Result.fail<SubmitAnswersResponse>('Assessment is already completed');
    }

    // 4. Process each answer
    const answersToSave: Answer[] = [];

    for (const answerInput of request.answers) {
      const questionId = new UniqueEntityID(answerInput.questionId);

      // Get question to validate answer
      const question = await this.questionRepository.findById(questionId);
      if (!question) {
        return Result.fail<SubmitAnswersResponse>(`Question ${answerInput.questionId} not found`);
      }

      // Create answer value based on question type
      let answerValueOrError: Result<AnswerValue>;

      switch (question.type.value) {
        case QuestionTypeEnum.DROPDOWN:
          answerValueOrError = AnswerValue.createDropdown(answerInput.value.selected);
          break;
        case QuestionTypeEnum.TEXT:
          answerValueOrError = AnswerValue.createText(answerInput.value.text);
          break;
        case QuestionTypeEnum.CNPJ:
          answerValueOrError = AnswerValue.createCNPJ(answerInput.value.cnpj);
          break;
        case QuestionTypeEnum.NUMBER:
          answerValueOrError = AnswerValue.createNumber(answerInput.value.number);
          break;
        case QuestionTypeEnum.FILE_UPLOAD:
          answerValueOrError = AnswerValue.createFileUpload(answerInput.value.fileIds);
          break;
        default:
          return Result.fail<SubmitAnswersResponse>(`Unknown question type: ${question.type.value}`);
      }

      if (answerValueOrError.isFailure) {
        return Result.fail<SubmitAnswersResponse>(
          `Invalid answer for question ${answerInput.questionId}: ${answerValueOrError.error}`
        );
      }

      const answerValue = answerValueOrError.getValue();

      // Validate answer against question
      const validationResult = question.validateAnswer(answerValue);
      if (validationResult.isFailure) {
        return Result.fail<SubmitAnswersResponse>(
          `Validation failed for question ${answerInput.questionId}: ${validationResult.error}`
        );
      }

      // Check if answer already exists
      const existingAnswer = await this.answerRepository.findByAssessmentAndQuestion(
        assessmentId,
        questionId,
      );

      if (existingAnswer) {
        // Update existing answer
        const updateResult = existingAnswer.updateValue(answerValue);
        if (updateResult.isFailure) {
          return Result.fail<SubmitAnswersResponse>(updateResult.error || 'Failed to update answer');
        }
        if (answerInput.comment) {
          existingAnswer.updateComment(answerInput.comment);
        }
        answersToSave.push(existingAnswer);
      } else {
        // Create new answer
        const answerOrError = Answer.create({
          assessmentId,
          questionId,
          value: answerValue,
          comment: answerInput.comment || null,
        });

        if (answerOrError.isFailure) {
          return Result.fail<SubmitAnswersResponse>(answerOrError.error || 'Failed to create answer');
        }

        answersToSave.push(answerOrError.getValue());
      }
    }

    // 5. Save all answers
    await this.answerRepository.saveMany(answersToSave);

    // 6. Update assessment progress
    const totalQuestions = await this.questionRepository.countBySurveyVersionId(
      assessment.surveyVersionId,
    );
    const answeredQuestions = await this.answerRepository.countByAssessmentId(assessmentId);
    
    assessment.calculateProgress(totalQuestions, answeredQuestions);
    await this.assessmentRepository.save(assessment);

    const isCompleted = assessment.finalScore === 100;

    return Result.ok<SubmitAnswersResponse>({
      success: true,
      progress: assessment.finalScore,
      isCompleted,
    });
  }
}
