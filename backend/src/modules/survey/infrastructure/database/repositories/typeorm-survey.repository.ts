import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISurveyRepository } from '../../../domain/repositories/survey.repository.interface';
import { Survey } from '../../../domain/entities/survey.entity';
import { SurveySchema } from '../entities/survey.schema';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { SurveyMapper } from '../mappers/survey.mapper';

@Injectable()
export class TypeORMSurveyRepository implements ISurveyRepository {
  constructor(
    @InjectRepository(SurveySchema)
    private readonly surveyRepository: Repository<SurveySchema>,
  ) {}

  async save(survey: Survey): Promise<void> {
    const schema = SurveyMapper.toPersistence(survey);
    await this.surveyRepository.save(schema);
  }

  async findById(id: UniqueEntityID): Promise<Survey | null> {
    const schema = await this.surveyRepository.findOne({ where: { id: id.toString() } });
    return schema ? SurveyMapper.toDomain(schema) : null;
  }

  async findAll(isActive?: boolean): Promise<Survey[]> {
    const where = isActive !== undefined ? { isActive } : {};
    const schemas = await this.surveyRepository.find({ where, order: { createdAt: 'DESC' } });
    return schemas.map(SurveyMapper.toDomain);
  }

  async exists(id: UniqueEntityID): Promise<boolean> {
    const count = await this.surveyRepository.count({ where: { id: id.toString() } });
    return count > 0;
  }

  async delete(id: UniqueEntityID): Promise<void> {
    await this.surveyRepository.delete(id.toString());
  }
}
