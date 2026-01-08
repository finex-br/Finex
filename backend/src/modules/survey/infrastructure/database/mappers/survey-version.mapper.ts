import { SurveyVersion } from '../../../domain/entities/survey-version.entity';
import { SurveyVersionSchema } from '../entities/survey-version.schema';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';

export class SurveyVersionMapper {
  public static toDomain(schema: SurveyVersionSchema): SurveyVersion {
    const versionOrError = SurveyVersion.create(
      {
        surveyId: new UniqueEntityID(schema.surveyId),
        versionNumber: schema.versionNumber,
        effectiveDate: schema.effectiveDate,
        createdAt: schema.createdAt,
        updatedAt: schema.updatedAt,
      },
      new UniqueEntityID(schema.id),
    );

    if (versionOrError.isFailure) {
      throw new Error(versionOrError.error);
    }

    return versionOrError.getValue();
  }

  public static toPersistence(version: SurveyVersion): SurveyVersionSchema {
    const schema = new SurveyVersionSchema();
    schema.id = version.id.toString();
    schema.surveyId = version.surveyId.toString();
    schema.versionNumber = version.versionNumber;
    schema.effectiveDate = version.effectiveDate;
    schema.createdAt = version.createdAt;
    schema.updatedAt = version.updatedAt;
    return schema;
  }
}
