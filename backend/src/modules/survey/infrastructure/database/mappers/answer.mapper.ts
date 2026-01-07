import { Answer } from '../../../domain/entities/answer.entity';
import { AnswerSchema } from '../entities/answer.schema';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { AnswerValue } from '../../../domain/value-objects/answer-value.vo';
import { QuestionTypeEnum } from '../../../domain/value-objects/question-type.vo';

export class AnswerMapper {
  public static toDomain(schema: AnswerSchema, questionType: QuestionTypeEnum): Answer {
    const valueOrError = AnswerValue.createFromJSON(schema.valueJson, questionType);
    if (valueOrError.isFailure) {
      throw new Error(valueOrError.error);
    }

    const answerOrError = Answer.create(
      {
        assessmentId: new UniqueEntityID(schema.assessmentId),
        questionId: new UniqueEntityID(schema.questionId),
        value: valueOrError.getValue(),
        comment: schema.comment,
        createdAt: schema.createdAt,
        updatedAt: schema.updatedAt,
      },
      new UniqueEntityID(schema.id),
    );

    if (answerOrError.isFailure) {
      throw new Error(answerOrError.error);
    }

    return answerOrError.getValue();
  }

  public static toPersistence(answer: Answer): AnswerSchema {
    const schema = new AnswerSchema();
    schema.id = answer.id.toString();
    schema.assessmentId = answer.assessmentId.toString();
    schema.questionId = answer.questionId.toString();
    schema.valueJson = answer.value.data;
    schema.comment = answer.comment;
    schema.createdAt = answer.createdAt;
    schema.updatedAt = answer.updatedAt;
    return schema;
  }
}
