import { Assessment } from '../../../domain/entities/assessment.entity';
import { AssessmentSchema } from '../entities/assessment.schema';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { AssessmentStatus } from '../../../domain/value-objects/assessment-status.vo';

export class AssessmentMapper {
  public static toDomain(schema: AssessmentSchema): Assessment {
    const statusOrError = AssessmentStatus.create(schema.status);
    if (statusOrError.isFailure) {
      throw new Error(statusOrError.error);
    }

    const assessmentOrError = Assessment.create(
      {
        companyId: new UniqueEntityID(schema.companyId),
        surveyVersionId: new UniqueEntityID(schema.surveyVersionId),
        status: statusOrError.getValue(),
        finalScore: Number(schema.finalScore),
        createdAt: schema.createdAt,
        updatedAt: schema.updatedAt,
      },
      new UniqueEntityID(schema.id),
    );

    if (assessmentOrError.isFailure) {
      throw new Error(assessmentOrError.error);
    }

    return assessmentOrError.getValue();
  }

  public static toPersistence(assessment: Assessment): AssessmentSchema {
    const schema = new AssessmentSchema();
    schema.id = assessment.id.toString();
    schema.companyId = assessment.companyId.toString();
    schema.surveyVersionId = assessment.surveyVersionId.toString();
    schema.status = assessment.status.value;
    schema.finalScore = assessment.finalScore;
    schema.createdAt = assessment.createdAt;
    schema.updatedAt = assessment.updatedAt;
    return schema;
  }
}
