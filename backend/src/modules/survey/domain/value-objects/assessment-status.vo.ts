import { ValueObject } from '../../../../shared/core/value-object';
import { Result } from '../../../../shared/core/result';

export enum AssessmentStatusEnum {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

interface AssessmentStatusProps {
  value: AssessmentStatusEnum;
}

/**
 * AssessmentStatus Value Object
 * Represents the completion status of an assessment
 */
export class AssessmentStatus extends ValueObject<AssessmentStatusProps> {
  private constructor(props: AssessmentStatusProps) {
    super(props);
  }

  get value(): AssessmentStatusEnum {
    return this.props.value;
  }

  public static create(value: string): Result<AssessmentStatus> {
    if (!value || value.trim().length === 0) {
      return Result.fail<AssessmentStatus>('Assessment status cannot be empty');
    }

    const upperValue = value.toUpperCase();
    if (!Object.values(AssessmentStatusEnum).includes(upperValue as AssessmentStatusEnum)) {
      return Result.fail<AssessmentStatus>(
        `Invalid assessment status: ${value}. Must be one of: ${Object.values(AssessmentStatusEnum).join(', ')}`,
      );
    }

    return Result.ok<AssessmentStatus>(
      new AssessmentStatus({ value: upperValue as AssessmentStatusEnum }),
    );
  }

  public static inProgress(): AssessmentStatus {
    return new AssessmentStatus({ value: AssessmentStatusEnum.IN_PROGRESS });
  }

  public static completed(): AssessmentStatus {
    return new AssessmentStatus({ value: AssessmentStatusEnum.COMPLETED });
  }

  public isInProgress(): boolean {
    return this.value === AssessmentStatusEnum.IN_PROGRESS;
  }

  public isCompleted(): boolean {
    return this.value === AssessmentStatusEnum.COMPLETED;
  }
}
