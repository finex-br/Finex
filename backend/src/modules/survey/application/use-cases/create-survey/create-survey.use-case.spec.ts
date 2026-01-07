import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CreateSurveyUseCase } from './create-survey.use-case';
import { ISurveyRepository } from '../../../domain/repositories/survey.repository.interface';
import { Survey } from '../../../domain/entities/survey.entity';

describe('CreateSurveyUseCase', () => {
  let useCase: CreateSurveyUseCase;
  let surveyRepository: jest.Mocked<ISurveyRepository>;

  beforeEach(() => {
    surveyRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      exists: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new CreateSurveyUseCase(surveyRepository);
  });

  it('should create a survey successfully', async () => {
    const request = {
      title: 'Diagnóstico 360',
      description: 'Questionário de diagnóstico empresarial',
    };

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().surveyId).toBeDefined();
    expect(surveyRepository.save).toHaveBeenCalledTimes(1);
    
    const savedSurvey = surveyRepository.save.mock.calls[0][0] as Survey;
    expect(savedSurvey.title).toBe(request.title);
    expect(savedSurvey.description).toBe(request.description);
    expect(savedSurvey.isActive).toBe(true);
  });

  it('should fail with empty title', async () => {
    const request = {
      title: '',
      description: 'Description',
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Title is required');
    expect(surveyRepository.save).not.toHaveBeenCalled();
  });

  it('should fail with empty description', async () => {
    const request = {
      title: 'Title',
      description: '',
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Description is required');
    expect(surveyRepository.save).not.toHaveBeenCalled();
  });

  it('should fail with title exceeding 255 characters', async () => {
    const request = {
      title: 'a'.repeat(256),
      description: 'Description',
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('255 characters');
    expect(surveyRepository.save).not.toHaveBeenCalled();
  });
});
