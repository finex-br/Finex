import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAssessmentRepository } from '../../../domain/repositories/assessment.repository.interface';
import { Assessment } from '../../../domain/entities/assessment.entity';
import { AssessmentSchema } from '../entities/assessment.schema';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { AssessmentMapper } from '../mappers/assessment.mapper';

@Injectable()
export class TypeORMAssessmentRepository implements IAssessmentRepository {
  constructor(
    @InjectRepository(AssessmentSchema)
    private readonly assessmentRepository: Repository<AssessmentSchema>,
  ) {}

  async save(assessment: Assessment): Promise<void> {
    const schema = AssessmentMapper.toPersistence(assessment);
    await this.assessmentRepository.save(schema);
  }

  async findById(id: UniqueEntityID): Promise<Assessment | null> {
    const schema = await this.assessmentRepository.findOne({ 
      where: { id: id.toString() } 
    });
    return schema ? AssessmentMapper.toDomain(schema) : null;
  }

  async findByCompanyAndSurveyVersion(
    companyId: UniqueEntityID,
    surveyVersionId: UniqueEntityID,
  ): Promise<Assessment | null> {
    const schema = await this.assessmentRepository.findOne({
      where: {
        companyId: companyId.toString(),
        surveyVersionId: surveyVersionId.toString(),
      },
    });
    return schema ? AssessmentMapper.toDomain(schema) : null;
  }

  async findByCompanyId(companyId: UniqueEntityID): Promise<Assessment[]> {
    const schemas = await this.assessmentRepository.find({
      where: { companyId: companyId.toString() },
      order: { createdAt: 'DESC' },
    });
    return schemas.map(AssessmentMapper.toDomain);
  }

  async findAll(filters?: { 
    companyId?: string; 
    surveyId?: string; 
    status?: string;
  }): Promise<Assessment[]> {
    const queryBuilder = this.assessmentRepository
      .createQueryBuilder('assessment')
      .leftJoinAndSelect('assessment.surveyVersion', 'version')
      .leftJoinAndSelect('version.survey', 'survey');

    if (filters?.companyId) {
      queryBuilder.andWhere('assessment.companyId = :companyId', { 
        companyId: filters.companyId 
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere('assessment.status = :status', { 
        status: filters.status 
      });
    }

    if (filters?.surveyId) {
      queryBuilder.andWhere('survey.id = :surveyId', { 
        surveyId: filters.surveyId 
      });
    }

    queryBuilder.orderBy('assessment.createdAt', 'DESC');

    const schemas = await queryBuilder.getMany();
    return schemas.map(AssessmentMapper.toDomain);
  }

  async exists(
    companyId: UniqueEntityID,
    surveyVersionId: UniqueEntityID,
  ): Promise<boolean> {
    const count = await this.assessmentRepository.count({
      where: {
        companyId: companyId.toString(),
        surveyVersionId: surveyVersionId.toString(),
      },
    });
    return count > 0;
  }
}
