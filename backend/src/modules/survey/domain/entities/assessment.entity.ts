import { Entity } from '../../../../shared/core/entity';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';
import { Result } from '../../../../shared/core/result';
import { AssessmentStatus } from '../value-objects/assessment-status.vo';

interface AssessmentProps {
  companyId: UniqueEntityID;
  surveyVersionId: UniqueEntityID;
  status: AssessmentStatus;
  finalScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAssessmentProps {
  companyId: UniqueEntityID;
  surveyVersionId: UniqueEntityID;
  status?: AssessmentStatus;
  finalScore?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Assessment Entity
 * Represents a company's response to a survey version
 */
export class Assessment extends Entity<AssessmentProps> {
  private constructor(props: AssessmentProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get companyId(): UniqueEntityID {
    return this.props.companyId;
  }

  get surveyVersionId(): UniqueEntityID {
    return this.props.surveyVersionId;
  }

  get status(): AssessmentStatus {
    return this.props.status;
  }

  get finalScore(): number {
    return this.props.finalScore;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public calculateProgress(totalQuestions: number, answeredQuestions: number): void {
    if (totalQuestions === 0) {
      this.props.finalScore = 0;
      return;
    }

    this.props.finalScore = Math.round((answeredQuestions / totalQuestions) * 100 * 100) / 100;
    this.props.updatedAt = new Date();
  }

  public complete(): Result<void> {
    if (this.props.status.isCompleted()) {
      return Result.fail<void>('Assessment is already completed');
    }

    if (this.props.finalScore < 100) {
      return Result.fail<void>('Cannot complete assessment - not all questions answered');
    }

    this.props.status = AssessmentStatus.completed();
    this.props.updatedAt = new Date();
    return Result.ok<void>();
  }

  public canBeAnsweredBy(companyMemberRole: string): boolean {
    // Only OWNER can answer
    return companyMemberRole === 'OWNER';
  }

  public static create(
    props: CreateAssessmentProps,
    id?: UniqueEntityID,
  ): Result<Assessment> {
    if (!props.companyId) {
      return Result.fail<Assessment>('Company ID is required');
    }

    if (!props.surveyVersionId) {
      return Result.fail<Assessment>('Survey version ID is required');
    }

    const assessment = new Assessment(
      {
        companyId: props.companyId,
        surveyVersionId: props.surveyVersionId,
        status: props.status ?? AssessmentStatus.inProgress(),
        finalScore: props.finalScore ?? 0,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );

    return Result.ok<Assessment>(assessment);
  }
}
