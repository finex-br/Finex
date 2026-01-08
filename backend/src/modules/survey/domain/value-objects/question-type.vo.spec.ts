import { describe, it, expect } from '@jest/globals';
import { QuestionType, QuestionTypeEnum } from './question-type.vo';

describe('QuestionType', () => {
  describe('create', () => {
    it('should create a valid DROPDOWN question type', () => {
      const result = QuestionType.create('DROPDOWN');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(QuestionTypeEnum.DROPDOWN);
    });

    it('should create question type case-insensitively', () => {
      const result = QuestionType.create('dropdown');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(QuestionTypeEnum.DROPDOWN);
    });

    it('should create all valid question types', () => {
      const types = ['DROPDOWN', 'TEXT', 'CNPJ', 'NUMBER', 'FILE_UPLOAD'];

      types.forEach((type) => {
        const result = QuestionType.create(type);
        expect(result.isSuccess).toBe(true);
      });
    });

    it('should fail with empty string', () => {
      const result = QuestionType.create('');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Question type cannot be empty');
    });

    it('should fail with whitespace only', () => {
      const result = QuestionType.create('   ');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Question type cannot be empty');
    });

    it('should fail with invalid question type', () => {
      const result = QuestionType.create('INVALID_TYPE');

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Invalid question type');
    });
  });

  describe('type checking methods', () => {
    it('should correctly identify dropdown type', () => {
      const questionType = QuestionType.create('DROPDOWN').getValue();

      expect(questionType.isDropdown()).toBe(true);
      expect(questionType.isText()).toBe(false);
      expect(questionType.isCNPJ()).toBe(false);
      expect(questionType.isNumber()).toBe(false);
      expect(questionType.isFileUpload()).toBe(false);
    });

    it('should correctly identify text type', () => {
      const questionType = QuestionType.create('TEXT').getValue();

      expect(questionType.isText()).toBe(true);
      expect(questionType.isDropdown()).toBe(false);
    });

    it('should correctly identify CNPJ type', () => {
      const questionType = QuestionType.create('CNPJ').getValue();

      expect(questionType.isCNPJ()).toBe(true);
      expect(questionType.isDropdown()).toBe(false);
    });

    it('should correctly identify number type', () => {
      const questionType = QuestionType.create('NUMBER').getValue();

      expect(questionType.isNumber()).toBe(true);
      expect(questionType.isDropdown()).toBe(false);
    });

    it('should correctly identify file upload type', () => {
      const questionType = QuestionType.create('FILE_UPLOAD').getValue();

      expect(questionType.isFileUpload()).toBe(true);
      expect(questionType.isDropdown()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should be equal when types are the same', () => {
      const type1 = QuestionType.create('DROPDOWN').getValue();
      const type2 = QuestionType.create('dropdown').getValue();

      expect(type1.equals(type2)).toBe(true);
    });

    it('should not be equal when types are different', () => {
      const type1 = QuestionType.create('DROPDOWN').getValue();
      const type2 = QuestionType.create('TEXT').getValue();

      expect(type1.equals(type2)).toBe(false);
    });
  });
});
