import { Entity } from '../../../../shared/core/entity';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';
import { Result } from '../../../../shared/core/result';

interface SurveyVersionProps {
  surveyId: UniqueEntityID;
  versionNumber: number;
  effectiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSurveyVersionProps {
  surveyId: UniqueEntityID;
  versionNumber: number;
  effectiveDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * SurveyVersion Entity
 * Represents a specific version of a survey with its questions
 */
export class SurveyVersion extends Entity<SurveyVersionProps> {
  private constructor(props: SurveyVersionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get surveyId(): UniqueEntityID {
    return this.props.surveyId;
  }

  get versionNumber(): number {
    return this.props.versionNumber;
  }

  get effectiveDate(): Date {
    return this.props.effectiveDate;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public static create(
    props: CreateSurveyVersionProps,
    id?: UniqueEntityID,
  ): Result<SurveyVersion> {
    if (!props.surveyId) {
      return Result.fail<SurveyVersion>('Survey ID is required');
    }

    if (!props.versionNumber || props.versionNumber < 1) {
      return Result.fail<SurveyVersion>('Version number must be greater than zero');
    }

    const surveyVersion = new SurveyVersion(
      {
        surveyId: props.surveyId,
        versionNumber: props.versionNumber,
        effectiveDate: props.effectiveDate ?? new Date(),
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );

    return Result.ok<SurveyVersion>(surveyVersion);
  }
}
