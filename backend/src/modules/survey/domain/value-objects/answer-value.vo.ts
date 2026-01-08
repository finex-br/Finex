import { ValueObject } from '../../../../shared/core/value-object';
import { Result } from '../../../../shared/core/result';
import { QuestionTypeEnum } from './question-type.vo';

interface AnswerValueProps {
  data: any;
  type: QuestionTypeEnum;
}

/**
 * AnswerValue Value Object
 * Represents the value of an answer to a question
 * Structure varies based on question type
 */
export class AnswerValue extends ValueObject<AnswerValueProps> {
  private constructor(props: AnswerValueProps) {
    super(props);
  }

  get data(): any {
    return this.props.data;
  }

  get type(): QuestionTypeEnum {
    return this.props.type;
  }

  /**
   * Create dropdown answer: { selected: string }
   */
  public static createDropdown(selected: string): Result<AnswerValue> {
    if (!selected || selected.trim().length === 0) {
      return Result.fail<AnswerValue>('Dropdown selection cannot be empty');
    }

    return Result.ok<AnswerValue>(
      new AnswerValue({
        data: { selected: selected.trim() },
        type: QuestionTypeEnum.DROPDOWN,
      }),
    );
  }

  /**
   * Create text answer: { text: string }
   */
  public static createText(text: string): Result<AnswerValue> {
    if (!text || text.trim().length === 0) {
      return Result.fail<AnswerValue>('Text answer cannot be empty');
    }

    return Result.ok<AnswerValue>(
      new AnswerValue({
        data: { text: text.trim() },
        type: QuestionTypeEnum.TEXT,
      }),
    );
  }

  /**
   * Create CNPJ answer: { cnpj: string }
   * Validates format only (XX.XXX.XXX/XXXX-XX)
   */
  public static createCNPJ(cnpj: string): Result<AnswerValue> {
    if (!cnpj || cnpj.trim().length === 0) {
      return Result.fail<AnswerValue>('CNPJ cannot be empty');
    }

    const cleanCnpj = cnpj.replace(/\D/g, '');

    if (cleanCnpj.length !== 14) {
      return Result.fail<AnswerValue>('CNPJ must have exactly 14 digits');
    }

    // Format: XX.XXX.XXX/XXXX-XX
    const formatted = cleanCnpj.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5',
    );

    return Result.ok<AnswerValue>(
      new AnswerValue({
        data: { cnpj: formatted },
        type: QuestionTypeEnum.CNPJ,
      }),
    );
  }

  /**
   * Create number answer: { number: number }
   * Only accepts integers
   */
  public static createNumber(number: number): Result<AnswerValue> {
    if (typeof number !== 'number' || isNaN(number)) {
      return Result.fail<AnswerValue>('Number must be a valid number');
    }

    if (!Number.isInteger(number)) {
      return Result.fail<AnswerValue>('Number must be an integer');
    }

    return Result.ok<AnswerValue>(
      new AnswerValue({
        data: { number },
        type: QuestionTypeEnum.NUMBER,
      }),
    );
  }

  /**
   * Create file upload answer: { fileIds: string[] }
   * Multiple files allowed
   */
  public static createFileUpload(fileIds: string[]): Result<AnswerValue> {
    if (!fileIds || !Array.isArray(fileIds)) {
      return Result.fail<AnswerValue>('File IDs must be an array');
    }

    if (fileIds.length === 0) {
      return Result.fail<AnswerValue>('At least one file must be uploaded');
    }

    // Validate all file IDs are non-empty strings
    const validFileIds = fileIds.every(
      (id) => typeof id === 'string' && id.trim().length > 0,
    );

    if (!validFileIds) {
      return Result.fail<AnswerValue>('All file IDs must be non-empty strings');
    }

    return Result.ok<AnswerValue>(
      new AnswerValue({
        data: { fileIds },
        type: QuestionTypeEnum.FILE_UPLOAD,
      }),
    );
  }

  /**
   * Create from raw JSON data (for persistence)
   */
  public static createFromJSON(data: any, type: QuestionTypeEnum): Result<AnswerValue> {
    if (!data) {
      return Result.fail<AnswerValue>('Answer data cannot be null or undefined');
    }

    // Validate structure based on type
    switch (type) {
      case QuestionTypeEnum.DROPDOWN:
        if (!data.selected || typeof data.selected !== 'string') {
          return Result.fail<AnswerValue>('Invalid dropdown answer structure');
        }
        break;

      case QuestionTypeEnum.TEXT:
        if (!data.text || typeof data.text !== 'string') {
          return Result.fail<AnswerValue>('Invalid text answer structure');
        }
        break;

      case QuestionTypeEnum.CNPJ:
        if (!data.cnpj || typeof data.cnpj !== 'string') {
          return Result.fail<AnswerValue>('Invalid CNPJ answer structure');
        }
        break;

      case QuestionTypeEnum.NUMBER:
        if (typeof data.number !== 'number') {
          return Result.fail<AnswerValue>('Invalid number answer structure');
        }
        break;

      case QuestionTypeEnum.FILE_UPLOAD:
        if (!Array.isArray(data.fileIds)) {
          return Result.fail<AnswerValue>('Invalid file upload answer structure');
        }
        break;

      default:
        return Result.fail<AnswerValue>(`Unknown question type: ${type}`);
    }

    return Result.ok<AnswerValue>(new AnswerValue({ data, type }));
  }
}
