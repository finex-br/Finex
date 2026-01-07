import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISurveyVersionRepository } from '../../../domain/repositories/survey-version.repository.interface';
import { SurveyVersion } from '../../../domain/entities/survey-version.entity';
import { SurveyVersionSchema } from '../entities/survey-version.schema';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { SurveyVersionMapper } from '../mappers/survey-version.mapper';

@Injectable()
export class TypeORMSurveyVersionRepository implements ISurveyVersionRepository {
  constructor(
    @InjectRepository(SurveyVersionSchema)
    private readonly versionRepository: Repository<SurveyVersionSchema>,
  ) {}

  async save(version: SurveyVersion): Promise<void> {
    const schema = SurveyVersionMapper.toPersistence(version);
    await this.versionRepository.save(schema);
  }

  async findById(id: UniqueEntityID): Promise<SurveyVersion | null> {
    const schema = await this.versionRepository.findOne({ 
      where: { id: id.toString() } 
    });
    return schema ? SurveyVersionMapper.toDomain(schema) : null;
  }

  async findBySurveyId(surveyId: UniqueEntityID): Promise<SurveyVersion[]> {
    const schemas = await this.versionRepository.find({
      where: { surveyId: surveyId.toString() },
      order: { versionNumber: 'DESC' },
    });
    return schemas.map(SurveyVersionMapper.toDomain);
  }

  async findLatestBySurveyId(surveyId: UniqueEntityID): Promise<SurveyVersion | null> {
    const schema = await this.versionRepository.findOne({
      where: { surveyId: surveyId.toString() },
      order: { versionNumber: 'DESC' },
    });
    return schema ? SurveyVersionMapper.toDomain(schema) : null;
  }

  async exists(id: UniqueEntityID): Promise<boolean> {
    const count = await this.versionRepository.count({ 
      where: { id: id.toString() } 
    });
    return count > 0;
  }
}
