import { Injectable } from '@nestjs/common';
import { Result } from '../../../../../shared/core/result';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { IAssessmentRepository } from '../../../domain/repositories/assessment.repository.interface';
import { IQuestionRepository } from '../../../domain/repositories/question.repository.interface';
import { IAnswerRepository } from '../../../domain/repositories/answer.repository.interface';

export interface CompleteAssessmentRequest {
  assessmentId: string;
  companyId: string;
}

export interface CompleteAssessmentResponse {
  success: boolean;
  finalScore: number;
  completedAt: Date;
}

@Injectable()
export class CompleteAssessmentUseCase {
  constructor(
    private readonly assessmentRepository: IAssessmentRepository,
    private readonly questionRepository: IQuestionRepository,
    private readonly answerRepository: IAnswerRepository,
  ) {}

  async execute(request: CompleteAssessmentRequest): Promise<Result<CompleteAssessmentResponse>> {
    // 1. Validate input
    if (!request.assessmentId) {
      return Result.fail<CompleteAssessmentResponse>('Assessment ID is required');
    }

    if (!request.companyId) {
      return Result.fail<CompleteAssessmentResponse>('Company ID is required');
    }

    const assessmentId = new UniqueEntityID(request.assessmentId);
    const companyId = new UniqueEntityID(request.companyId);

    // 2. Get assessment
    const assessment = await this.assessmentRepository.findByIdAndCompany(assessmentId, companyId);
    if (!assessment) {
      return Result.fail<CompleteAssessmentResponse>('Assessment not found');
    }

    // 3. Check if already completed
    if (assessment.status.isCompleted()) {
      return Result.fail<CompleteAssessmentResponse>('Assessment is already completed');
    }

    // 4. Verify all questions are answered
    const totalQuestions = await this.questionRepository.countBySurveyVersionId(
      assessment.surveyVersionId,
    );
    const answeredQuestions = await this.answerRepository.countByAssessmentId(assessmentId);

    if (answeredQuestions < totalQuestions) {
      return Result.fail<CompleteAssessmentResponse>(
        `Cannot complete assessment. Answered ${answeredQuestions} out of ${totalQuestions} questions.`
      );
    }

    // 5. Update progress one last time
    assessment.calculateProgress(totalQuestions, answeredQuestions);

    // 6. Mark as completed
    const completeResult = assessment.complete();
    if (completeResult.isFailure) {
      return Result.fail<CompleteAssessmentResponse>(completeResult.error || 'Failed to complete assessment');
    }

    // 7. Save assessment
    await this.assessmentRepository.save(assessment);

    return Result.ok<CompleteAssessmentResponse>({
      success: true,
      finalScore: assessment.finalScore,
      completedAt: assessment.updatedAt,
    });
  }
}
