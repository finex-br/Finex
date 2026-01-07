import { Entity } from '../../../../shared/core/entity';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';
import { Result } from '../../../../shared/core/result';
import { QuestionType } from '../value-objects/question-type.vo';
import { DropdownOptions } from '../value-objects/dropdown-options.vo';
import { AnswerValue } from '../value-objects/answer-value.vo';

interface QuestionProps {
  surveyVersionId: UniqueEntityID;
  text: string;
  type: QuestionType;
  options: DropdownOptions | null;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQuestionProps {
  surveyVersionId: UniqueEntityID;
  text: string;
  type: QuestionType;
  options?: DropdownOptions | null;
  orderIndex: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Question Entity
 * Represents a question in a survey version
 */
export class Question extends Entity<QuestionProps> {
  private constructor(props: QuestionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get surveyVersionId(): UniqueEntityID {
    return this.props.surveyVersionId;
  }

  get text(): string {
    return this.props.text;
  }

  get type(): QuestionType {
    return this.props.type;
  }

  get options(): DropdownOptions | null {
    return this.props.options;
  }

  get orderIndex(): number {
    return this.props.orderIndex;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public validateAnswer(value: AnswerValue): Result<void> {
    // Check if answer type matches question type
    if (value.type !== this.props.type.value) {
      return Result.fail<void>('Answer type does not match question type');
    }

    // Additional validation for dropdown
    if (this.props.type.isDropdown()) {
      if (!this.props.options) {
        return Result.fail<void>('Question has no options defined');
      }

      const selectedValue = value.data.selected;
      if (!this.props.options.contains(selectedValue)) {
        return Result.fail<void>('Selected value is not in the available options');
      }
    }

    return Result.ok<void>();
  }

  public static create(props: CreateQuestionProps, id?: UniqueEntityID): Result<Question> {
    if (!props.surveyVersionId) {
      return Result.fail<Question>('Survey version ID is required');
    }

    if (!props.text || props.text.trim().length === 0) {
      return Result.fail<Question>('Question text is required');
    }

    if (!props.type) {
      return Result.fail<Question>('Question type is required');
    }

    if (props.orderIndex < 0) {
      return Result.fail<Question>('Order index cannot be negative');
    }

    // Validate dropdown has options
    if (props.type.isDropdown() && !props.options) {
      return Result.fail<Question>('Dropdown questions must have options');
    }

    // Validate non-dropdown doesn't have options
    if (!props.type.isDropdown() && props.options) {
      return Result.fail<Question>('Only dropdown questions can have options');
    }

    const question = new Question(
      {
        surveyVersionId: props.surveyVersionId,
        text: props.text.trim(),
        type: props.type,
        options: props.options ?? null,
        orderIndex: props.orderIndex,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );

    return Result.ok<Question>(question);
  }
}
