import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GetCompletedAssessmentsUseCase } from './get-completed-assessments.use-case';
import { IAssessmentRepository } from '../../../domain/repositories/assessment.repository.interface';
import { ISurveyRepository } from '../../../domain/repositories/survey.repository.interface';
import { ISurveyVersionRepository } from '../../../domain/repositories/survey-version.repository.interface';
import { ICompanyRepository } from '../../../../../shared/domain/repositories/company-repository.interface';
import { Assessment } from '../../../domain/entities/assessment.entity';
import { Survey } from '../../../domain/entities/survey.entity';
import { Company } from '../../../../../shared/domain/entities/company.entity';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { AssessmentStatus } from '../../../domain/value-objects/assessment-status.vo';

describe('GetCompletedAssessmentsUseCase', () => {
  let getCompletedAssessmentsUseCase: GetCompletedAssessmentsUseCase;
  let assessmentRepository: jest.Mocked<IAssessmentRepository>;
  let surveyRepository: jest.Mocked<ISurveyRepository>;
  let surveyVersionRepository: jest.Mocked<ISurveyVersionRepository>;
  let companyRepository: jest.Mocked<ICompanyRepository>;

  beforeEach(() => {
    // Mock repositories
    assessmentRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByCompanyAndSurvey: jest.fn(),
    } as any;

    surveyRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    } as any;

    surveyVersionRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findLatestBySurveyId: jest.fn(),
      findBySurveyId: jest.fn(),
    } as any;

    companyRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByCnpj: jest.fn(),
    } as any;

    getCompletedAssessmentsUseCase = new GetCompletedAssessmentsUseCase(
      assessmentRepository,
      surveyRepository,
      surveyVersionRepository,
      companyRepository,
    );
  });

  describe('Success Cases', () => {
    it('should return all completed assessments without filters', async () => {
      // Arrange
      const companyId = new UniqueEntityID();
      const surveyVersionId = new UniqueEntityID();
      const surveyId = new UniqueEntityID();

      const mockAssessment = Assessment.create({
        companyId,
        surveyVersionId,
        status: AssessmentStatus.create('COMPLETED').getValue(),
        finalScore: 85,
      }).getValue();

      const mockSurvey = Survey.create({
        title: 'Questionário ESG',
        description: 'Avaliação ESG',
        isActive: true,
      }, surveyId).getValue();

      const mockSurveyVersion = {
        id: surveyVersionId,
        surveyId: surveyId,
        versionNumber: 1,
        effectiveDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCompany = Company.create({
        name: 'Empresa Teste LTDA',
        sector: 'Tecnologia',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, companyId).getValue();

      assessmentRepository.findAll.mockResolvedValue([mockAssessment]);
      surveyVersionRepository.findById.mockResolvedValue(mockSurveyVersion as any);
      surveyRepository.findById.mockResolvedValue(mockSurvey);
      companyRepository.findById.mockResolvedValue(mockCompany);

      // Act
      const result = await getCompletedAssessmentsUseCase.execute({});

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(assessmentRepository.findAll).toHaveBeenCalledWith({
        companyId: undefined,
        surveyId: undefined,
        status: 'COMPLETED',
      });

      const response = result.getValue();
      expect(response.assessments).toHaveLength(1);
      expect(response.assessments[0].surveyTitle).toBe('Questionário ESG');
      expect(response.assessments[0].companyName).toBe('Empresa Teste LTDA');
      expect(response.assessments[0].progress).toBe(85);
      expect(response.assessments[0].status).toBe('COMPLETED');
    });

    it('should filter by companyId when provided', async () => {
      // Arrange
      const companyId = 'company-123';
      assessmentRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await getCompletedAssessmentsUseCase.execute({ companyId });

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(assessmentRepository.findAll).toHaveBeenCalledWith({
        companyId: 'company-123',
        surveyId: undefined,
        status: 'COMPLETED',
      });
    });

    it('should filter by surveyId when provided', async () => {
      // Arrange
      const surveyId = 'survey-456';
      assessmentRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await getCompletedAssessmentsUseCase.execute({ surveyId });

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(assessmentRepository.findAll).toHaveBeenCalledWith({
        companyId: undefined,
        surveyId: 'survey-456',
        status: 'COMPLETED',
      });
    });

    it('should filter by both companyId and surveyId when provided', async () => {
      // Arrange
      const companyId = 'company-123';
      const surveyId = 'survey-456';
      assessmentRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await getCompletedAssessmentsUseCase.execute({
        companyId,
        surveyId,
      });

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(assessmentRepository.findAll).toHaveBeenCalledWith({
        companyId: 'company-123',
        surveyId: 'survey-456',
        status: 'COMPLETED',
      });
    });

    it('should return empty array when no completed assessments exist', async () => {
      // Arrange
      assessmentRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await getCompletedAssessmentsUseCase.execute({});

      // Assert
      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      expect(response.assessments).toHaveLength(0);
    });

    it('should sort assessments by completion date (most recent first)', async () => {
      // Arrange
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const assessment1 = Assessment.create({
        companyId: new UniqueEntityID(),
        surveyVersionId: new UniqueEntityID(),
        status: AssessmentStatus.create('COMPLETED').getValue(),
        finalScore: 85,
      }).getValue();
      // Mock updatedAt
      Object.defineProperty(assessment1, 'updatedAt', { value: lastWeek });

      const assessment2 = Assessment.create({
        companyId: new UniqueEntityID(),
        surveyVersionId: new UniqueEntityID(),
        status: AssessmentStatus.create('COMPLETED').getValue(),
        finalScore: 90,
      }).getValue();
      Object.defineProperty(assessment2, 'updatedAt', { value: now });

      const assessment3 = Assessment.create({
        companyId: new UniqueEntityID(),
        surveyVersionId: new UniqueEntityID(),
        status: AssessmentStatus.create('COMPLETED').getValue(),
        finalScore: 75,
      }).getValue();
      Object.defineProperty(assessment3, 'updatedAt', { value: yesterday });

      const mockSurvey = Survey.create({
        title: 'Test Survey',
        isActive: true,
      }).getValue();

      assessmentRepository.findAll.mockResolvedValue([
        assessment1,
        assessment2,
        assessment3,
      ]);
      surveyRepository.findById.mockResolvedValue(mockSurvey);

      // Act
      const result = await getCompletedAssessmentsUseCase.execute({});

      // Assert
      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      expect(response.assessments).toHaveLength(3);
      
      // Should be sorted: now, yesterday, lastWeek
      expect(response.assessments[0].progress).toBe(90); // Most recent
      expect(response.assessments[1].progress).toBe(75);
      expect(response.assessments[2].progress).toBe(85); // Oldest
    });

    it('should include all required properties in DTO', async () => {
      // Arrange
      const companyId = new UniqueEntityID();
      const surveyVersionId = new UniqueEntityID();
      const surveyId = new UniqueEntityID();

      const mockAssessment = Assessment.create({
        companyId,
        surveyVersionId,
        status: AssessmentStatus.create('COMPLETED').getValue(),
        finalScore: 85,
      }).getValue();

      const mockSurvey = Survey.create({
        title: 'Test Survey',
        description: 'Test Description',
        isActive: true,
      }, surveyId).getValue();

      assessmentRepository.findAll.mockResolvedValue([mockAssessment]);
      surveyRepository.findById.mockResolvedValue(mockSurvey);

      // Act
      const result = await getCompletedAssessmentsUseCase.execute({});

      // Assert
      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      const assessmentDTO = response.assessments[0];

      expect(assessmentDTO).toHaveProperty('id');
      expect(assessmentDTO).toHaveProperty('companyId');
      expect(assessmentDTO).toHaveProperty('companyName');
      expect(assessmentDTO).toHaveProperty('surveyId');
      expect(assessmentDTO).toHaveProperty('surveyTitle');
      expect(assessmentDTO).toHaveProperty('progress');
      expect(assessmentDTO).toHaveProperty('completedAt');
      expect(assessmentDTO).toHaveProperty('status');
    });

    it('should handle survey not found gracefully', async () => {
      // Arrange
      const mockAssessment = Assessment.create({
        companyId: new UniqueEntityID(),
        surveyVersionId: new UniqueEntityID(),
        status: AssessmentStatus.create('COMPLETED').getValue(),
        finalScore: 85,
      }).getValue();

      assessmentRepository.findAll.mockResolvedValue([mockAssessment]);
      surveyRepository.findById.mockResolvedValue(null);
      companyRepository.findById.mockResolvedValue(null);

      // Act
      const result = await getCompletedAssessmentsUseCase.execute({});

      // Assert
      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      expect(response.assessments[0].surveyTitle).toBe('N/A');
    });
  });

  describe('Failure Cases', () => {
    it('should fail when assessment repository throws error', async () => {
      // Arrange
      assessmentRepository.findAll.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // Act
      const result = await getCompletedAssessmentsUseCase.execute({});

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Failed to fetch completed assessments');
    });

    it('should fail when survey repository throws error', async () => {
      // Arrange
      const mockAssessment = Assessment.create({
        companyId: new UniqueEntityID(),
        surveyVersionId: new UniqueEntityID(),
        status: AssessmentStatus.create('COMPLETED').getValue(),
        finalScore: 85,
      }).getValue();

      const mockSurveyVersion = {
        id: new UniqueEntityID(),
        surveyId: new UniqueEntityID(),
        versionNumber: 1,
        effectiveDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      assessmentRepository.findAll.mockResolvedValue([mockAssessment]);
      surveyVersionRepository.findById.mockResolvedValue(mockSurveyVersion as any);
      surveyRepository.findById.mockRejectedValue(
        new Error('Failed to fetch survey'),
      );

      // Act
      const result = await getCompletedAssessmentsUseCase.execute({});

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Failed to fetch completed assessments');
    });
  });

  describe('Company Name Integration', () => {
    it('should show company name when company is found', async () => {
      // Arrange
      const companyId = new UniqueEntityID();
      
      const mockAssessment = Assessment.create({
        companyId,
        surveyVersionId: new UniqueEntityID(),
        status: AssessmentStatus.create('COMPLETED').getValue(),
        finalScore: 85,
      }).getValue();

      const mockSurvey = Survey.create({
        title: 'Test Survey',
        isActive: true,
      }).getValue();

      const mockCompany = Company.create({
        name: 'Empresa XYZ',
        sector: 'Tecnologia',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, companyId).getValue();

      assessmentRepository.findAll.mockResolvedValue([mockAssessment]);
      surveyRepository.findById.mockResolvedValue(mockSurvey);
      companyRepository.findById.mockResolvedValue(mockCompany);

      // Act
      const result = await getCompletedAssessmentsUseCase.execute({});

      // Assert
      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      expect(response.assessments[0].companyName).toBe('Empresa XYZ');
    });

    it('should show N/A when company is not found', async () => {
      // Arrange
      const mockAssessment = Assessment.create({
        companyId: new UniqueEntityID(),
        surveyVersionId: new UniqueEntityID(),
        status: AssessmentStatus.create('COMPLETED').getValue(),
        finalScore: 85,
      }).getValue();

      const mockSurvey = Survey.create({
        title: 'Test Survey',
        isActive: true,
      }).getValue();

      assessmentRepository.findAll.mockResolvedValue([mockAssessment]);
      surveyRepository.findById.mockResolvedValue(mockSurvey);
      companyRepository.findById.mockResolvedValue(null);

      // Act
      const result = await getCompletedAssessmentsUseCase.execute({});

      // Assert
      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      expect(response.assessments[0].companyName).toBe('N/A');
    });
  });
});
