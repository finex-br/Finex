import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GetQuestionsUseCase } from './get-questions.use-case';
import { IAssessmentRepository } from '../../../domain/repositories/assessment.repository.interface';
import { IQuestionRepository } from '../../../domain/repositories/question.repository.interface';
import { IAnswerRepository } from '../../../domain/repositories/answer.repository.interface';
import { Assessment } from '../../../domain/entities/assessment.entity';
import { Question } from '../../../domain/entities/question.entity';
import { Answer } from '../../../domain/entities/answer.entity';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { QuestionType } from '../../../domain/value-objects/question-type.vo';
import { AnswerValue } from '../../../domain/value-objects/answer-value.vo';
import { AssessmentStatus } from '../../../domain/value-objects/assessment-status.vo';

describe('GetQuestionsUseCase', () => {
  let useCase: GetQuestionsUseCase;
  let assessmentRepository: jest.Mocked<IAssessmentRepository>;
  let questionRepository: jest.Mocked<IQuestionRepository>;
  let answerRepository: jest.Mocked<IAnswerRepository>;

  const assessmentId = new UniqueEntityID('assessment-1');
  const companyId = new UniqueEntityID('company-1');
  const versionId = new UniqueEntityID('version-1');

  const createMockAssessment = () => {
    return Assessment.create(
      {
        companyId,
        surveyVersionId: versionId,
        status: AssessmentStatus.inProgress(),
        finalScore: 0,
      },
      assessmentId,
    ).getValue();
  };

  const createMockQuestions = (count: number) => {
    const type = QuestionType.create('TEXT').getValue();
    return Array.from({ length: count }, (_, i) =>
      Question.create(
        {
          surveyVersionId: versionId,
          text: `Question ${i + 1}`,
          type,
          orderIndex: i,
        },
        new UniqueEntityID(`question-${i + 1}`),
      ).getValue(),
    );
  };

  beforeEach(() => {
    assessmentRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByIdAndCompany: jest.fn(),
      findByCompanyAndSurveyVersion: jest.fn(),
      findByCompanyId: jest.fn(),
      findAll: jest.fn(),
      exists: jest.fn(),
    } as any;

    questionRepository = {
      save: jest.fn(),
      saveMany: jest.fn(),
      findById: jest.fn(),
      findBySurveyVersionId: jest.fn(),
      countBySurveyVersionId: jest.fn(),
    } as any;

    answerRepository = {
      save: jest.fn(),
      saveMany: jest.fn(),
      findById: jest.fn(),
      findByAssessmentId: jest.fn(),
      findByAssessmentAndQuestion: jest.fn(),
      countByAssessmentId: jest.fn(),
      deleteByAssessmentId: jest.fn(),
    } as any;

    useCase = new GetQuestionsUseCase(
      assessmentRepository,
      questionRepository,
      answerRepository,
    );
  });

  it('should return 1 question per page', async () => {
    const assessment = createMockAssessment();
    const questions = createMockQuestions(5);

    assessmentRepository.findByIdAndCompany.mockResolvedValue(assessment);
    questionRepository.findBySurveyVersionId.mockResolvedValue(questions);
    answerRepository.findByAssessmentId.mockResolvedValue([]);

    const result = await useCase.execute({
      assessmentId: 'assessment-1',
      companyId: 'company-1',
      page: 1,
    });

    expect(result.isSuccess).toBe(true);
    const response = result.getValue();
    expect(response.questions).toHaveLength(1);
    expect(response.questions[0].text).toBe('Question 1');
  });

  it('should calculate totalPages correctly for N questions', async () => {
    const assessment = createMockAssessment();
    const questions = createMockQuestions(10);

    assessmentRepository.findByIdAndCompany.mockResolvedValue(assessment);
    questionRepository.findBySurveyVersionId.mockResolvedValue(questions);
    answerRepository.findByAssessmentId.mockResolvedValue([]);

    const result = await useCase.execute({
      assessmentId: 'assessment-1',
      companyId: 'company-1',
      page: 1,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().totalPages).toBe(10);
  });

  it('should return correct question for each page number', async () => {
    const assessment = createMockAssessment();
    const questions = createMockQuestions(3);

    assessmentRepository.findByIdAndCompany.mockResolvedValue(assessment);
    questionRepository.findBySurveyVersionId.mockResolvedValue(questions);
    answerRepository.findByAssessmentId.mockResolvedValue([]);

    // Page 1 -> Question 1
    const result1 = await useCase.execute({
      assessmentId: 'assessment-1',
      companyId: 'company-1',
      page: 1,
    });
    expect(result1.getValue().questions[0].text).toBe('Question 1');

    // Page 2 -> Question 2
    const result2 = await useCase.execute({
      assessmentId: 'assessment-1',
      companyId: 'company-1',
      page: 2,
    });
    expect(result2.getValue().questions[0].text).toBe('Question 2');

    // Page 3 -> Question 3
    const result3 = await useCase.execute({
      assessmentId: 'assessment-1',
      companyId: 'company-1',
      page: 3,
    });
    expect(result3.getValue().questions[0].text).toBe('Question 3');
  });

  it('should return existing answers for the question', async () => {
    const assessment = createMockAssessment();
    const questions = createMockQuestions(2);
    const answerValue = AnswerValue.createText('My answer').getValue();
    const answer = Answer.create({
      assessmentId,
      questionId: new UniqueEntityID('question-1'),
      value: answerValue,
      comment: 'A comment',
    }).getValue();

    assessmentRepository.findByIdAndCompany.mockResolvedValue(assessment);
    questionRepository.findBySurveyVersionId.mockResolvedValue(questions);
    answerRepository.findByAssessmentId.mockResolvedValue([answer]);

    const result = await useCase.execute({
      assessmentId: 'assessment-1',
      companyId: 'company-1',
      page: 1,
    });

    expect(result.isSuccess).toBe(true);
    const q = result.getValue().questions[0];
    expect(q.currentAnswer).toBeDefined();
    expect(q.currentAnswer!.comment).toBe('A comment');
  });

  it('should fail with invalid assessmentId', async () => {
    const result = await useCase.execute({
      assessmentId: '',
      companyId: 'company-1',
      page: 1,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Assessment ID');
  });

  it('should fail with page out of range', async () => {
    const assessment = createMockAssessment();
    const questions = createMockQuestions(3);

    assessmentRepository.findByIdAndCompany.mockResolvedValue(assessment);
    questionRepository.findBySurveyVersionId.mockResolvedValue(questions);

    const result = await useCase.execute({
      assessmentId: 'assessment-1',
      companyId: 'company-1',
      page: 4,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('does not exist');
  });

  it('should calculate progress correctly', async () => {
    const assessment = createMockAssessment();
    assessment.calculateProgress(5, 2); // 40%
    const questions = createMockQuestions(5);

    assessmentRepository.findByIdAndCompany.mockResolvedValue(assessment);
    questionRepository.findBySurveyVersionId.mockResolvedValue(questions);
    answerRepository.findByAssessmentId.mockResolvedValue([]);

    const result = await useCase.execute({
      assessmentId: 'assessment-1',
      companyId: 'company-1',
      page: 1,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().progress).toBe(40);
  });
});
