import { ValueObject } from '../../../../shared/core/value-object';
import { Result } from '../../../../shared/core/result';

export enum QuestionTypeEnum {
  DROPDOWN = 'DROPDOWN',
  TEXT = 'TEXT',
  CNPJ = 'CNPJ',
  NUMBER = 'NUMBER',
  FILE_UPLOAD = 'FILE_UPLOAD',
}

interface QuestionTypeProps {
  value: QuestionTypeEnum;
}

/**
 * QuestionType Value Object
 * Represents the type of a survey question
 */
export class QuestionType extends ValueObject<QuestionTypeProps> {
  private constructor(props: QuestionTypeProps) {
    super(props);
  }

  get value(): QuestionTypeEnum {
    return this.props.value;
  }

  public static create(value: string): Result<QuestionType> {
    if (!value || value.trim().length === 0) {
      return Result.fail<QuestionType>('Question type cannot be empty');
    }

    const upperValue = value.toUpperCase();
    if (!Object.values(QuestionTypeEnum).includes(upperValue as QuestionTypeEnum)) {
      return Result.fail<QuestionType>(
        `Invalid question type: ${value}. Must be one of: ${Object.values(QuestionTypeEnum).join(', ')}`,
      );
    }

    return Result.ok<QuestionType>(
      new QuestionType({ value: upperValue as QuestionTypeEnum }),
    );
  }

  public isDropdown(): boolean {
    return this.value === QuestionTypeEnum.DROPDOWN;
  }

  public isText(): boolean {
    return this.value === QuestionTypeEnum.TEXT;
  }

  public isCNPJ(): boolean {
    return this.value === QuestionTypeEnum.CNPJ;
  }

  public isNumber(): boolean {
    return this.value === QuestionTypeEnum.NUMBER;
  }

  public isFileUpload(): boolean {
    return this.value === QuestionTypeEnum.FILE_UPLOAD;
  }
}
