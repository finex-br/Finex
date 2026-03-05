import { Injectable } from '@nestjs/common';
import { Result } from '../../../../../shared/core/result';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { IQuestionRepository } from '../../../domain/repositories/question.repository.interface';
import { IAssessmentRepository } from '../../../domain/repositories/assessment.repository.interface';
import { IAnswerRepository } from '../../../domain/repositories/answer.repository.interface';

const QUESTIONS_PER_PAGE = 1;

export interface GetQuestionsRequest {
  assessmentId: string;
  companyId: string;
  page: number;
}

export interface QuestionResponse {
  id: string;
  text: string;
  type: string;
  options?: string[];
  orderIndex: number;
  currentAnswer?: {
    value: any;
    comment: string | null;
  };
}

export interface GetQuestionsResponse {
  assessmentId: string;
  page: number;
  totalPages: number;
  progress: number;
  questions: QuestionResponse[];
}

@Injectable()
export class GetQuestionsUseCase {
  constructor(
    private readonly assessmentRepository: IAssessmentRepository,
    private readonly questionRepository: IQuestionRepository,
    private readonly answerRepository: IAnswerRepository,
  ) {}

  async execute(request: GetQuestionsRequest): Promise<Result<GetQuestionsResponse>> {
    // 1. Validate input
    if (!request.assessmentId) {
      return Result.fail<GetQuestionsResponse>('Assessment ID is required');
    }

    if (!request.companyId) {
      return Result.fail<GetQuestionsResponse>('Company ID is required');
    }

    if (request.page < 1) {
      return Result.fail<GetQuestionsResponse>('Page must be greater than 0');
    }

    const assessmentId = new UniqueEntityID(request.assessmentId);
    const companyId = new UniqueEntityID(request.companyId);

    // 2. Get assessment
    const assessment = await this.assessmentRepository.findByIdAndCompany(assessmentId, companyId);
    if (!assessment) {
      return Result.fail<GetQuestionsResponse>('Assessment not found');
    }

    // 3. Get all questions for this survey version
    const allQuestions = await this.questionRepository.findBySurveyVersionId(
      assessment.surveyVersionId,
    );

    if (allQuestions.length === 0) {
      return Result.fail<GetQuestionsResponse>('No questions found for this survey');
    }

    // 4. Calculate pagination
    const totalPages = Math.ceil(allQuestions.length / QUESTIONS_PER_PAGE);
    
    if (request.page > totalPages) {
      return Result.fail<GetQuestionsResponse>(`Page ${request.page} does not exist. Total pages: ${totalPages}`);
    }

    const startIndex = (request.page - 1) * QUESTIONS_PER_PAGE;
    const endIndex = startIndex + QUESTIONS_PER_PAGE;
    const pageQuestions = allQuestions.slice(startIndex, endIndex);

    // 5. Get existing answers for these questions
    const answers = await this.answerRepository.findByAssessmentId(assessmentId);
    const answersMap = new Map(
      answers.map(answer => [answer.questionId.toString(), answer])
    );

    // 6. Build response
    const questionResponses: QuestionResponse[] = pageQuestions.map(question => {
      const answer = answersMap.get(question.id.toString());
      
      const response: QuestionResponse = {
        id: question.id.toString(),
        text: question.text,
        type: question.type.value,
        orderIndex: question.orderIndex,
      };

      if (question.options) {
        response.options = question.options.options;
      }

      if (answer) {
        response.currentAnswer = {
          value: answer.value.data,
          comment: answer.comment,
        };
      }

      return response;
    });

    return Result.ok<GetQuestionsResponse>({
      assessmentId: request.assessmentId,
      page: request.page,
      totalPages,
      progress: assessment.finalScore,
      questions: questionResponses,
    });
  }
}
