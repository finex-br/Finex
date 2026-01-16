import { Entity } from '../../../../shared/core/entity';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';
import { Result } from '../../../../shared/core/result';

interface SurveyProps {
  title: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSurveyProps {
  title: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Survey Entity
 * Represents a survey/questionnaire that can have multiple versions
 */
export class Survey extends Entity<SurveyProps> {
  private constructor(props: SurveyProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public activate(): Result<void> {
    if (this.props.isActive) {
      return Result.fail<void>('Survey is already active');
    }

    this.props.isActive = true;
    this.props.updatedAt = new Date();
    return Result.ok<void>();
  }

  public deactivate(): Result<void> {
    if (!this.props.isActive) {
      return Result.fail<void>('Survey is already inactive');
    }

    this.props.isActive = false;
    this.props.updatedAt = new Date();
    return Result.ok<void>();
  }

  public updateInfo(title: string, description: string): Result<void> {
    if (!title || title.trim().length === 0) {
      return Result.fail<void>('Title cannot be empty');
    }

    if (!description || description.trim().length === 0) {
      return Result.fail<void>('Description cannot be empty');
    }

    if (title.trim().length > 255) {
      return Result.fail<void>('Title cannot exceed 255 characters');
    }

    this.props.title = title.trim();
    this.props.description = description.trim();
    this.props.updatedAt = new Date();
    return Result.ok<void>();
  }

  public static create(props: CreateSurveyProps, id?: UniqueEntityID): Result<Survey> {
    if (!props.title || props.title.trim().length === 0) {
      return Result.fail<Survey>('Title is required');
    }

    if (props.title.trim().length > 255) {
      return Result.fail<Survey>('Title cannot exceed 255 characters');
    }

    const survey = new Survey(
      {
        title: props.title.trim(),
        description: props.description?.trim(),
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );

    return Result.ok<Survey>(survey);
  }
}
