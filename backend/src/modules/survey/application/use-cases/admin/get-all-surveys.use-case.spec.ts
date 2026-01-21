import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GetAllSurveysUseCase } from './get-all-surveys.use-case';
import { ISurveyRepository } from '../../../domain/repositories/survey.repository.interface';
import { Survey } from '../../../domain/entities/survey.entity';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';

describe('GetAllSurveysUseCase', () => {
  let getAllSurveysUseCase: GetAllSurveysUseCase;
  let surveyRepository: jest.Mocked<ISurveyRepository>;

  beforeEach(() => {
    // Mock repository
    surveyRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    } as any;

    getAllSurveysUseCase = new GetAllSurveysUseCase(surveyRepository);
  });

  describe('Success Cases', () => {
    it('should return all surveys with correct DTO mapping', async () => {
      // Arrange
      const mockSurvey1 = Survey.create({
        title: 'Questionário ESG',
        description: 'Avaliação ESG completa',
        isActive: true,
      }).getValue();

      const mockSurvey2 = Survey.create({
        title: 'Questionário Compliance',
        isActive: false,
      }).getValue();

      surveyRepository.findAll.mockResolvedValue([mockSurvey1, mockSurvey2]);

      // Act
      const result = await getAllSurveysUseCase.execute();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(surveyRepository.findAll).toHaveBeenCalledTimes(1);

      const response = result.getValue();
      expect(response.surveys).toHaveLength(2);

      // Check first survey
      expect(response.surveys[0].title).toBe('Questionário ESG');
      expect(response.surveys[0].description).toBe('Avaliação ESG completa');
      expect(response.surveys[0].isActive).toBe(true);
      expect(response.surveys[0].id).toBeDefined();
      expect(response.surveys[0].createdAt).toBeDefined();

      // Check second survey
      expect(response.surveys[1].title).toBe('Questionário Compliance');
      expect(response.surveys[1].description).toBe('');
      expect(response.surveys[1].isActive).toBe(false);
    });

    it('should return empty array when no surveys exist', async () => {
      // Arrange
      surveyRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await getAllSurveysUseCase.execute();

      // Assert
      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      expect(response.surveys).toHaveLength(0);
    });

    it('should include all survey properties in the DTO', async () => {
      // Arrange
      const mockSurvey = Survey.create({
        title: 'Test Survey',
        description: 'Test Description',
        isActive: true,
      }).getValue();

      surveyRepository.findAll.mockResolvedValue([mockSurvey]);

      // Act
      const result = await getAllSurveysUseCase.execute();

      // Assert
      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      const surveyDTO = response.surveys[0];

      expect(surveyDTO).toHaveProperty('id');
      expect(surveyDTO).toHaveProperty('title');
      expect(surveyDTO).toHaveProperty('description');
      expect(surveyDTO).toHaveProperty('isActive');
      expect(surveyDTO).toHaveProperty('createdAt');
      expect(surveyDTO).toHaveProperty('updatedAt');
    });
  });

  describe('Failure Cases', () => {
    it('should fail when repository throws error', async () => {
      // Arrange
      surveyRepository.findAll.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const result = await getAllSurveysUseCase.execute();

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Failed to fetch surveys');
    });

    it('should handle repository returning null', async () => {
      // Arrange
      surveyRepository.findAll.mockResolvedValue(null as any);

      // Act
      const result = await getAllSurveysUseCase.execute();

      // Assert
      expect(result.isFailure).toBe(true);
    });
  });

  describe('Sorting and Ordering', () => {
    it('should maintain order returned by repository', async () => {
      // Arrange
      const survey1 = Survey.create({
        title: 'Survey A',
        isActive: true,
      }).getValue();

      const survey2 = Survey.create({
        title: 'Survey B',
        isActive: true,
      }).getValue();

      const survey3 = Survey.create({
        title: 'Survey C',
        isActive: false,
      }).getValue();

      surveyRepository.findAll.mockResolvedValue([survey1, survey2, survey3]);

      // Act
      const result = await getAllSurveysUseCase.execute();

      // Assert
      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      expect(response.surveys[0].title).toBe('Survey A');
      expect(response.surveys[1].title).toBe('Survey B');
      expect(response.surveys[2].title).toBe('Survey C');
    });
  });
});
