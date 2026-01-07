import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IQuestionRepository } from '../../../domain/repositories/question.repository.interface';
import { Question } from '../../../domain/entities/question.entity';
import { QuestionSchema } from '../entities/question.schema';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { QuestionMapper } from '../mappers/question.mapper';

@Injectable()
export class TypeORMQuestionRepository implements IQuestionRepository {
  constructor(
    @InjectRepository(QuestionSchema)
    private readonly questionRepository: Repository<QuestionSchema>,
  ) {}

  async save(question: Question): Promise<void> {
    const schema = QuestionMapper.toPersistence(question);
    await this.questionRepository.save(schema);
  }

  async saveMany(questions: Question[]): Promise<void> {
    const schemas = questions.map(QuestionMapper.toPersistence);
    await this.questionRepository.save(schemas);
  }

  async findById(id: UniqueEntityID): Promise<Question | null> {
    const schema = await this.questionRepository.findOne({ 
      where: { id: id.toString() } 
    });
    return schema ? QuestionMapper.toDomain(schema) : null;
  }

  async findBySurveyVersionId(surveyVersionId: UniqueEntityID): Promise<Question[]> {
    const schemas = await this.questionRepository.find({
      where: { surveyVersionId: surveyVersionId.toString() },
      order: { orderIndex: 'ASC' },
    });
    return schemas.map(QuestionMapper.toDomain);
  }

  async countBySurveyVersionId(surveyVersionId: UniqueEntityID): Promise<number> {
    return await this.questionRepository.count({
      where: { surveyVersionId: surveyVersionId.toString() },
    });
  }
}
