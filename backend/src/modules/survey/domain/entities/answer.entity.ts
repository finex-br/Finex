import { Entity } from '../../../../shared/core/entity';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';
import { Result } from '../../../../shared/core/result';
import { AnswerValue } from '../value-objects/answer-value.vo';

interface AnswerProps {
  assessmentId: UniqueEntityID;
  questionId: UniqueEntityID;
  value: AnswerValue;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAnswerProps {
  assessmentId: UniqueEntityID;
  questionId: UniqueEntityID;
  value: AnswerValue;
  comment?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Answer Entity
 * Represents an answer to a specific question in an assessment
 */
export class Answer extends Entity<AnswerProps> {
  private constructor(props: AnswerProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get assessmentId(): UniqueEntityID {
    return this.props.assessmentId;
  }

  get questionId(): UniqueEntityID {
    return this.props.questionId;
  }

  get value(): AnswerValue {
    return this.props.value;
  }

  get comment(): string | null {
    return this.props.comment;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateValue(value: AnswerValue): Result<void> {
    if (!value) {
      return Result.fail<void>('Answer value cannot be null');
    }

    this.props.value = value;
    this.props.updatedAt = new Date();
    return Result.ok<void>();
  }

  public updateComment(comment: string | null): void {
    this.props.comment = comment ? comment.trim() : null;
    this.props.updatedAt = new Date();
  }

  public static create(props: CreateAnswerProps, id?: UniqueEntityID): Result<Answer> {
    if (!props.assessmentId) {
      return Result.fail<Answer>('Assessment ID is required');
    }

    if (!props.questionId) {
      return Result.fail<Answer>('Question ID is required');
    }

    if (!props.value) {
      return Result.fail<Answer>('Answer value is required');
    }

    const answer = new Answer(
      {
        assessmentId: props.assessmentId,
        questionId: props.questionId,
        value: props.value,
        comment: props.comment ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );

    return Result.ok<Answer>(answer);
  }
}
