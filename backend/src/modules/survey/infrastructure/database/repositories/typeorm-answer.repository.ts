import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAnswerRepository } from '../../../domain/repositories/answer.repository.interface';
import { Answer } from '../../../domain/entities/answer.entity';
import { AnswerSchema } from '../entities/answer.schema';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { AnswerMapper } from '../mappers/answer.mapper';
import { QuestionTypeEnum } from '../../../domain/value-objects/question-type.vo';

@Injectable()
export class TypeORMAnswerRepository implements IAnswerRepository {
  constructor(
    @InjectRepository(AnswerSchema)
    private readonly answerRepository: Repository<AnswerSchema>,
  ) {}

  async save(answer: Answer): Promise<void> {
    const schema = AnswerMapper.toPersistence(answer);
    await this.answerRepository.save(schema);
  }

  async saveMany(answers: Answer[]): Promise<void> {
    const schemas = answers.map(AnswerMapper.toPersistence);
    await this.answerRepository.save(schemas);
  }

  async findById(id: UniqueEntityID): Promise<Answer | null> {
    const schema = await this.answerRepository.findOne({ 
      where: { id: id.toString() },
      relations: ['question'],
    });
    
    if (!schema) return null;
    
    return AnswerMapper.toDomain(schema, schema.question.type as QuestionTypeEnum);
  }

  async findByAssessmentId(assessmentId: UniqueEntityID): Promise<Answer[]> {
    const schemas = await this.answerRepository.find({
      where: { assessmentId: assessmentId.toString() },
      relations: ['question'],
      order: { createdAt: 'ASC' },
    });
    
    return schemas.map(schema => 
      AnswerMapper.toDomain(schema, schema.question.type as QuestionTypeEnum)
    );
  }

  async findByAssessmentAndQuestion(
    assessmentId: UniqueEntityID,
    questionId: UniqueEntityID,
  ): Promise<Answer | null> {
    const schema = await this.answerRepository.findOne({
      where: {
        assessmentId: assessmentId.toString(),
        questionId: questionId.toString(),
      },
      relations: ['question'],
    });
    
    if (!schema) return null;
    
    return AnswerMapper.toDomain(schema, schema.question.type as QuestionTypeEnum);
  }

  async countByAssessmentId(assessmentId: UniqueEntityID): Promise<number> {
    return await this.answerRepository.count({
      where: { assessmentId: assessmentId.toString() },
    });
  }

  async deleteByAssessmentId(assessmentId: UniqueEntityID): Promise<void> {
    await this.answerRepository.delete({ assessmentId: assessmentId.toString() });
  }
}
