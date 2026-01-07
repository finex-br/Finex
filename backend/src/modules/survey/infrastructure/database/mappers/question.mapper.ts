import { Question } from '../../../domain/entities/question.entity';
import { QuestionSchema } from '../entities/question.schema';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { QuestionType } from '../../../domain/value-objects/question-type.vo';
import { DropdownOptions } from '../../../domain/value-objects/dropdown-options.vo';

export class QuestionMapper {
  public static toDomain(schema: QuestionSchema): Question {
    const typeOrError = QuestionType.create(schema.type);
    if (typeOrError.isFailure) {
      throw new Error(typeOrError.error);
    }

    const questionType = typeOrError.getValue();
    let options: DropdownOptions | null = null;

    if (questionType.isDropdown() && schema.options) {
      const optionsOrError = DropdownOptions.create(schema.options);
      if (optionsOrError.isFailure) {
        throw new Error(optionsOrError.error);
      }
      options = optionsOrError.getValue();
    }

    const questionOrError = Question.create(
      {
        surveyVersionId: new UniqueEntityID(schema.surveyVersionId),
        text: schema.text,
        type: questionType,
        options: options,
        orderIndex: schema.orderIndex,
        createdAt: schema.createdAt,
        updatedAt: schema.updatedAt,
      },
      new UniqueEntityID(schema.id),
    );

    if (questionOrError.isFailure) {
      throw new Error(questionOrError.error);
    }

    return questionOrError.getValue();
  }

  public static toPersistence(question: Question): QuestionSchema {
    const schema = new QuestionSchema();
    schema.id = question.id.toString();
    schema.surveyVersionId = question.surveyVersionId.toString();
    schema.text = question.text;
    schema.type = question.type.value;
    schema.options = question.options ? question.options.options : null;
    schema.orderIndex = question.orderIndex;
    schema.createdAt = question.createdAt;
    schema.updatedAt = question.updatedAt;
    return schema;
  }
}
