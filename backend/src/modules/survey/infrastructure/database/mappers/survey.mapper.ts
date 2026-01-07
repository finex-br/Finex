import { Survey } from '../../../domain/entities/survey.entity';
import { SurveySchema } from '../entities/survey.schema';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';

export class SurveyMapper {
  public static toDomain(schema: SurveySchema): Survey {
    const surveyOrError = Survey.create(
      {
        title: schema.title,
        description: schema.description,
        isActive: schema.isActive,
        createdAt: schema.createdAt,
        updatedAt: schema.updatedAt,
      },
      new UniqueEntityID(schema.id),
    );

    if (surveyOrError.isFailure) {
      throw new Error(surveyOrError.error);
    }

    return surveyOrError.getValue();
  }

  public static toPersistence(survey: Survey): SurveySchema {
    const schema = new SurveySchema();
    schema.id = survey.id.toString();
    schema.title = survey.title;
    schema.description = survey.description;
    schema.isActive = survey.isActive;
    schema.createdAt = survey.createdAt;
    schema.updatedAt = survey.updatedAt;
    return schema;
  }
}
