import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CreateSurveyUseCase } from './create-survey.use-case';
import { ISurveyRepository } from '../../../domain/repositories/survey.repository.interface';
import { ISurveyVersionRepository } from '../../../domain/repositories/survey-version.repository.interface';
import { CreateSurveyDTO } from '../../dtos/admin/create-survey.dto';

describe('CreateSurveyUseCase', () => {
  let createSurveyUseCase: CreateSurveyUseCase;
  let surveyRepository: jest.Mocked<ISurveyRepository>;
  let surveyVersionRepository: jest.Mocked<ISurveyVersionRepository>;

  beforeEach(() => {
    // Mock repositories
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

    createSurveyUseCase = new CreateSurveyUseCase(
      surveyRepository,
      surveyVersionRepository,
    );
  });

  describe('Success Cases', () => {
    it('should create a new survey with title and description', async () => {
      // Arrange
      const dto: CreateSurveyDTO = {
        title: 'Questionário de Maturidade ESG',
        description: 'Avaliação completa de práticas ESG',
      };

      // Act
      const result = await createSurveyUseCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(surveyRepository.save).toHaveBeenCalledTimes(1);
      expect(surveyVersionRepository.save).toHaveBeenCalledTimes(1);
      
      const surveyDTO = result.getValue();
      expect(surveyDTO.title).toBe(dto.title);
      expect(surveyDTO.description).toBe(dto.description);
      expect(surveyDTO.isActive).toBe(true);
      expect(surveyDTO.id).toBeDefined();
      expect(surveyDTO.versionId).toBeDefined();
      expect(surveyDTO.versionNumber).toBe(1);
    });

    it('should create a survey without description', async () => {
      // Arrange
      const dto: CreateSurveyDTO = {
        title: 'Questionário Simples',
      };

      // Act
      const result = await createSurveyUseCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      const surveyDTO = result.getValue();
      expect(surveyDTO.title).toBe(dto.title);
      expect(surveyDTO.description).toBeUndefined();
    });

    it('should create survey version 1 automatically', async () => {
      // Arrange
      const dto: CreateSurveyDTO = {
        title: 'Test Survey',
        description: 'Test Description',
      };

      // Act
      const result = await createSurveyUseCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(surveyVersionRepository.save).toHaveBeenCalled();
      
      const savedVersion = surveyVersionRepository.save.mock.calls[0][0];
      expect(savedVersion.versionNumber).toBe(1);
    });
  });

  describe('Validation Failures', () => {
    it('should fail if title is empty', async () => {
      // Arrange
      const dto: CreateSurveyDTO = {
        title: '',
        description: 'Valid description',
      };

      // Act
      const result = await createSurveyUseCase.execute(dto);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('title');
      expect(surveyRepository.save).not.toHaveBeenCalled();
    });

    it('should fail if title has less than 3 characters', async () => {
      // Arrange
      const dto: CreateSurveyDTO = {
        title: 'AB',
        description: 'Valid description',
      };

      // Act
      const result = await createSurveyUseCase.execute(dto);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('title');
      expect(result.error).toContain('3');
    });

    it('should fail if title is only whitespace', async () => {
      // Arrange
      const dto: CreateSurveyDTO = {
        title: '   ',
        description: 'Valid description',
      };

      // Act
      const result = await createSurveyUseCase.execute(dto);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(surveyRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('Repository Integration', () => {
    it('should save survey entity to repository', async () => {
      // Arrange
      const dto: CreateSurveyDTO = {
        title: 'Survey for Repository Test',
        description: 'Testing repository integration',
      };

      // Act
      await createSurveyUseCase.execute(dto);

      // Assert
      expect(surveyRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          title: dto.title,
          description: dto.description,
        })
      );
    });

    it('should create survey version linked to survey', async () => {
      // Arrange
      const dto: CreateSurveyDTO = {
        title: 'Survey with Version',
      };

      // Act
      await createSurveyUseCase.execute(dto);

      // Assert
      expect(surveyVersionRepository.save).toHaveBeenCalled();
      const savedVersion = surveyVersionRepository.save.mock.calls[0][0];
      expect(savedVersion.surveyId).toBeDefined();
    });
  });
});
