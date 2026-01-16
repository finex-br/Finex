import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AddQuestionUseCase } from './add-question.use-case';
import { IQuestionRepository } from '../../../domain/repositories/question.repository.interface';
import { ISurveyVersionRepository } from '../../../domain/repositories/survey-version.repository.interface';
import { AddQuestionDTO } from '../../dtos/admin/add-question.dto';
import { SurveyVersion } from '../../../domain/entities/survey-version.entity';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { Result } from '../../../../../shared/core/result';

describe('AddQuestionUseCase', () => {
  let addQuestionUseCase: AddQuestionUseCase;
  let questionRepository: jest.Mocked<IQuestionRepository>;
  let surveyVersionRepository: jest.Mocked<ISurveyVersionRepository>;

  beforeEach(() => {
    questionRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findBySurveyVersionId: jest.fn(),
    } as any;

    surveyVersionRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as any;

    addQuestionUseCase = new AddQuestionUseCase(
      questionRepository,
      surveyVersionRepository,
    );
  });

  describe('Success Cases - All Question Types', () => {
    const surveyVersionId = '550e8400-e29b-41d4-a716-446655440000';
    const mockVersion = {
      id: new UniqueEntityID(surveyVersionId),
      surveyId: new UniqueEntityID('survey-id'),
      versionNumber: 1,
      effectiveDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as SurveyVersion;

    beforeEach(() => {
      surveyVersionRepository.findById.mockResolvedValue(mockVersion);
    });

    it('should create a DROPDOWN question with options', async () => {
      const dto: AddQuestionDTO = {
        surveyVersionId,
        text: 'Qual o setor da sua empresa?',
        type: 'DROPDOWN',
        options: ['Tecnologia', 'Saúde', 'Educação', 'Varejo'],
        orderIndex: 1,
      };

      const result = await addQuestionUseCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      expect(questionRepository.save).toHaveBeenCalled();
      
      const question = result.getValue();
      expect(question.text).toBe(dto.text);
      expect(question.type).toBe('DROPDOWN');
      expect(question.options).toEqual(dto.options);
    });

    it('should create a TEXT question', async () => {
      const dto: AddQuestionDTO = {
        surveyVersionId,
        text: 'Descreva as principais atividades da empresa',
        type: 'TEXT',
        orderIndex: 2,
      };

      const result = await addQuestionUseCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      const question = result.getValue();
      expect(question.text).toBe(dto.text);
      expect(question.type).toBe('TEXT');
      expect(question.options).toBeUndefined();
    });

    it('should create a CNPJ question', async () => {
      const dto: AddQuestionDTO = {
        surveyVersionId,
        text: 'CNPJ da empresa',
        type: 'CNPJ',
        orderIndex: 3,
      };

      const result = await addQuestionUseCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      const question = result.getValue();
      expect(question.type).toBe('CNPJ');
    });

    it('should create a NUMBER question', async () => {
      const dto: AddQuestionDTO = {
        surveyVersionId,
        text: 'Quantos funcionários a empresa possui?',
        type: 'NUMBER',
        orderIndex: 4,
      };

      const result = await addQuestionUseCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      const question = result.getValue();
      expect(question.type).toBe('NUMBER');
    });

    it('should create a FILE_UPLOAD question', async () => {
      const dto: AddQuestionDTO = {
        surveyVersionId,
        text: 'Faça upload do relatório de sustentabilidade',
        type: 'FILE_UPLOAD',
        orderIndex: 5,
      };

      const result = await addQuestionUseCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      const question = result.getValue();
      expect(question.type).toBe('FILE_UPLOAD');
    });
  });

  describe('Validation Failures', () => {
    const mockVersion = {
      id: new UniqueEntityID('test-version-id'),
    } as SurveyVersion;

    it('should fail if survey version does not exist', async () => {
      surveyVersionRepository.findById.mockResolvedValue(null);

      const dto: AddQuestionDTO = {
        surveyVersionId: 'non-existent-id',
        text: 'Test question',
        type: 'TEXT',
        orderIndex: 1,
      };

      const result = await addQuestionUseCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Survey version not found');
      expect(questionRepository.save).not.toHaveBeenCalled();
    });

    it('should fail if question text is empty', async () => {
      surveyVersionRepository.findById.mockResolvedValue(mockVersion);

      const dto: AddQuestionDTO = {
        surveyVersionId: 'valid-id',
        text: '',
        type: 'TEXT',
        orderIndex: 1,
      };

      const result = await addQuestionUseCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('text');
    });

    it('should fail if question type is invalid', async () => {
      surveyVersionRepository.findById.mockResolvedValue(mockVersion);

      const dto: AddQuestionDTO = {
        surveyVersionId: 'valid-id',
        text: 'Valid question',
        type: 'INVALID_TYPE' as any,
        orderIndex: 1,
      };

      const result = await addQuestionUseCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Invalid question type');
    });

    it('should fail if DROPDOWN type has no options', async () => {
      const surveyVersionId = '550e8400-e29b-41d4-a716-446655440000';
      const mockVersion = {
        id: new UniqueEntityID(surveyVersionId),
      } as SurveyVersion;
      surveyVersionRepository.findById.mockResolvedValue(mockVersion);

      const dto: AddQuestionDTO = {
        surveyVersionId,
        text: 'Dropdown without options',
        type: 'DROPDOWN',
        orderIndex: 1,
      };

      const result = await addQuestionUseCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('options');
      expect(result.error).toContain('DROPDOWN');
    });

    it('should fail if DROPDOWN has less than 2 options', async () => {
      const surveyVersionId = '550e8400-e29b-41d4-a716-446655440000';
      const mockVersion = {
        id: new UniqueEntityID(surveyVersionId),
      } as SurveyVersion;
      surveyVersionRepository.findById.mockResolvedValue(mockVersion);

      const dto: AddQuestionDTO = {
        surveyVersionId,
        text: 'Dropdown with one option',
        type: 'DROPDOWN',
        options: ['Only one'],
        orderIndex: 1,
      };

      const result = await addQuestionUseCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('at least 2');
    });

    it('should fail if orderIndex is negative', async () => {
      surveyVersionRepository.findById.mockResolvedValue(mockVersion);

      const dto: AddQuestionDTO = {
        surveyVersionId: 'valid-id',
        text: 'Valid question',
        type: 'TEXT',
        orderIndex: -1,
      };

      const result = await addQuestionUseCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('orderIndex');
    });
  });

  describe('Repository Integration', () => {
    it('should save question entity to repository', async () => {
      const surveyVersionId = '550e8400-e29b-41d4-a716-446655440000';
      const mockVersion = {
        id: new UniqueEntityID(surveyVersionId),
      } as SurveyVersion;
      surveyVersionRepository.findById.mockResolvedValue(mockVersion);

      const dto: AddQuestionDTO = {
        surveyVersionId,
        text: 'Repository test question',
        type: 'TEXT',
        orderIndex: 1,
      };

      await addQuestionUseCase.execute(dto);

      expect(questionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          text: dto.text,
          orderIndex: dto.orderIndex,
        })
      );
    });
  });
});
