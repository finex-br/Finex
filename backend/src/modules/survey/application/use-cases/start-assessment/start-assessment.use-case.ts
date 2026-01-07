import { Injectable } from '@nestjs/common';
import { Result } from '../../../../../shared/core/result';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { Assessment } from '../../../domain/entities/assessment.entity';
import { IAssessmentRepository } from '../../../domain/repositories/assessment.repository.interface';
import { ISurveyVersionRepository } from '../../../domain/repositories/survey-version.repository.interface';
import { ISurveyRepository } from '../../../domain/repositories/survey.repository.interface';
import { IQuestionRepository } from '../../../domain/repositories/question.repository.interface';
import { IAnswerRepository } from '../../../domain/repositories/answer.repository.interface';

export interface StartAssessmentRequest {
  companyId: string;
  surveyId: string;
}

export interface StartAssessmentResponse {
  assessmentId: string;
  surveyTitle: string;
  totalQuestions: number;
  currentProgress: number;
  isResuming: boolean;
}

@Injectable()
export class StartAssessmentUseCase {
  constructor(
    private readonly assessmentRepository: IAssessmentRepository,
    private readonly surveyVersionRepository: ISurveyVersionRepository,
    private readonly surveyRepository: ISurveyRepository,
    private readonly questionRepository: IQuestionRepository,
    private readonly answerRepository: IAnswerRepository,
  ) {}

  async execute(request: StartAssessmentRequest): Promise<Result<StartAssessmentResponse>> {
    // 1. Validate input
    if (!request.companyId || !request.surveyId) {
      return Result.fail<StartAssessmentResponse>('Company ID and Survey ID are required');
    }

    const companyId = new UniqueEntityID(request.companyId);
    const surveyId = new UniqueEntityID(request.surveyId);

    // 2. Check if survey exists and is active
    const survey = await this.surveyRepository.findById(surveyId);
    if (!survey) {
      return Result.fail<StartAssessmentResponse>('Survey not found');
    }

    if (!survey.isActive) {
      return Result.fail<StartAssessmentResponse>('Survey is not active');
    }

    // 3. Get latest version of survey
    const latestVersion = await this.surveyVersionRepository.findLatestBySurveyId(surveyId);
    if (!latestVersion) {
      return Result.fail<StartAssessmentResponse>('Survey has no versions');
    }

    // 4. Count questions in this version
    const totalQuestions = await this.questionRepository.countBySurveyVersionId(latestVersion.id);
    if (totalQuestions === 0) {
      return Result.fail<StartAssessmentResponse>('Survey version has no questions');
    }

    // 5. Check if assessment already exists for this company and version
    let assessment = await this.assessmentRepository.findByCompanyAndSurveyVersion(
      companyId,
      latestVersion.id,
    );

    let isResuming = false;

    if (assessment) {
      // Resuming existing assessment
      isResuming = true;
    } else {
      // Create new assessment
      const assessmentOrError = Assessment.create({
        companyId,
        surveyVersionId: latestVersion.id,
      });

      if (assessmentOrError.isFailure) {
        return Result.fail<StartAssessmentResponse>(assessmentOrError.error || 'Failed to create assessment');
      }

      assessment = assessmentOrError.getValue();
      await this.assessmentRepository.save(assessment);
    }

    // 6. Calculate current progress
    const answeredQuestions = await this.answerRepository.countByAssessmentId(assessment.id);
    assessment.calculateProgress(totalQuestions, answeredQuestions);
    await this.assessmentRepository.save(assessment);

    return Result.ok<StartAssessmentResponse>({
      assessmentId: assessment.id.toString(),
      surveyTitle: survey.title,
      totalQuestions,
      currentProgress: assessment.finalScore,
      isResuming,
    });
  }
}
