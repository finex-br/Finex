import { describe, it, expect } from '@jest/globals';
import { AnswerValue } from './answer-value.vo';
import { QuestionTypeEnum } from './question-type.vo';

describe('AnswerValue', () => {
  describe('createDropdown', () => {
    it('should create valid dropdown answer', () => {
      const result = AnswerValue.createDropdown('Tecnologia');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().data).toEqual({ selected: 'Tecnologia' });
      expect(result.getValue().type).toBe(QuestionTypeEnum.DROPDOWN);
    });

    it('should trim whitespace', () => {
      const result = AnswerValue.createDropdown('  Tecnologia  ');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().data.selected).toBe('Tecnologia');
    });

    it('should fail with empty string', () => {
      const result = AnswerValue.createDropdown('');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Dropdown selection cannot be empty');
    });

    it('should fail with whitespace only', () => {
      const result = AnswerValue.createDropdown('   ');

      expect(result.isFailure).toBe(true);
    });
  });

  describe('createText', () => {
    it('should create valid text answer', () => {
      const result = AnswerValue.createText('Minha resposta em texto');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().data).toEqual({ text: 'Minha resposta em texto' });
      expect(result.getValue().type).toBe(QuestionTypeEnum.TEXT);
    });

    it('should trim whitespace', () => {
      const result = AnswerValue.createText('  Texto  ');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().data.text).toBe('Texto');
    });

    it('should fail with empty string', () => {
      const result = AnswerValue.createText('');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Text answer cannot be empty');
    });
  });

  describe('createCNPJ', () => {
    it('should create valid CNPJ answer with formatting', () => {
      const result = AnswerValue.createCNPJ('12345678000190');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().data).toEqual({ cnpj: '12.345.678/0001-90' });
      expect(result.getValue().type).toBe(QuestionTypeEnum.CNPJ);
    });

    it('should accept already formatted CNPJ', () => {
      const result = AnswerValue.createCNPJ('12.345.678/0001-90');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().data.cnpj).toBe('12.345.678/0001-90');
    });

    it('should accept partially formatted CNPJ', () => {
      const result = AnswerValue.createCNPJ('12345678/0001-90');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().data.cnpj).toBe('12.345.678/0001-90');
    });

    it('should fail with less than 14 digits', () => {
      const result = AnswerValue.createCNPJ('1234567800019');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('CNPJ must have exactly 14 digits');
    });

    it('should fail with more than 14 digits', () => {
      const result = AnswerValue.createCNPJ('123456780001901');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('CNPJ must have exactly 14 digits');
    });

    it('should fail with empty string', () => {
      const result = AnswerValue.createCNPJ('');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('CNPJ cannot be empty');
    });

    it('should fail with non-numeric characters only', () => {
      const result = AnswerValue.createCNPJ('abcdefghijklmn');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('CNPJ must have exactly 14 digits');
    });
  });

  describe('createNumber', () => {
    it('should create valid number answer', () => {
      const result = AnswerValue.createNumber(12345);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().data).toEqual({ number: 12345 });
      expect(result.getValue().type).toBe(QuestionTypeEnum.NUMBER);
    });

    it('should accept zero', () => {
      const result = AnswerValue.createNumber(0);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().data.number).toBe(0);
    });

    it('should accept negative integers', () => {
      const result = AnswerValue.createNumber(-100);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().data.number).toBe(-100);
    });

    it('should fail with decimal numbers', () => {
      const result = AnswerValue.createNumber(12.34);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Number must be an integer');
    });

    it('should fail with NaN', () => {
      const result = AnswerValue.createNumber(NaN);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Number must be a valid number');
    });

    it('should fail with non-number', () => {
      const result = AnswerValue.createNumber('123' as any);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Number must be a valid number');
    });
  });

  describe('createFileUpload', () => {
    it('should create valid file upload answer with single file', () => {
      const result = AnswerValue.createFileUpload(['file-uuid-1']);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().data).toEqual({ fileIds: ['file-uuid-1'] });
      expect(result.getValue().type).toBe(QuestionTypeEnum.FILE_UPLOAD);
    });

    it('should create valid file upload answer with multiple files', () => {
      const result = AnswerValue.createFileUpload(['file-uuid-1', 'file-uuid-2', 'file-uuid-3']);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().data.fileIds).toHaveLength(3);
    });

    it('should fail with empty array', () => {
      const result = AnswerValue.createFileUpload([]);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('At least one file must be uploaded');
    });

    it('should fail with null', () => {
      const result = AnswerValue.createFileUpload(null as any);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('File IDs must be an array');
    });

    it('should fail with array containing empty strings', () => {
      const result = AnswerValue.createFileUpload(['file-uuid-1', '', 'file-uuid-2']);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('All file IDs must be non-empty strings');
    });

    it('should fail with array containing non-strings', () => {
      const result = AnswerValue.createFileUpload(['file-uuid-1', 123 as any]);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('All file IDs must be non-empty strings');
    });
  });

  describe('createFromJSON', () => {
    it('should create dropdown answer from JSON', () => {
      const result = AnswerValue.createFromJSON(
        { selected: 'Option 1' },
        QuestionTypeEnum.DROPDOWN,
      );

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().type).toBe(QuestionTypeEnum.DROPDOWN);
    });

    it('should create text answer from JSON', () => {
      const result = AnswerValue.createFromJSON({ text: 'My text' }, QuestionTypeEnum.TEXT);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().type).toBe(QuestionTypeEnum.TEXT);
    });

    it('should create CNPJ answer from JSON', () => {
      const result = AnswerValue.createFromJSON(
        { cnpj: '12.345.678/0001-90' },
        QuestionTypeEnum.CNPJ,
      );

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().type).toBe(QuestionTypeEnum.CNPJ);
    });

    it('should create number answer from JSON', () => {
      const result = AnswerValue.createFromJSON({ number: 123 }, QuestionTypeEnum.NUMBER);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().type).toBe(QuestionTypeEnum.NUMBER);
    });

    it('should create file upload answer from JSON', () => {
      const result = AnswerValue.createFromJSON(
        { fileIds: ['file-1', 'file-2'] },
        QuestionTypeEnum.FILE_UPLOAD,
      );

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().type).toBe(QuestionTypeEnum.FILE_UPLOAD);
    });

    it('should fail with null data', () => {
      const result = AnswerValue.createFromJSON(null, QuestionTypeEnum.TEXT);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Answer data cannot be null or undefined');
    });

    it('should fail with invalid dropdown structure', () => {
      const result = AnswerValue.createFromJSON({ value: 'wrong' }, QuestionTypeEnum.DROPDOWN);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Invalid dropdown answer structure');
    });

    it('should fail with invalid text structure', () => {
      const result = AnswerValue.createFromJSON({ value: 'wrong' }, QuestionTypeEnum.TEXT);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Invalid text answer structure');
    });
  });
});
