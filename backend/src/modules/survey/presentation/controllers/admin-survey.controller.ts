import { Controller, Post, Body, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateSurveyDto } from '../dtos/create-survey.dto';
import { CreateSurveyUseCase } from '../../application/use-cases/create-survey/create-survey.use-case';
import { CreateSurveyVersionUseCase } from '../../application/use-cases/create-survey-version/create-survey-version.use-case';
import { CreateSurveyVersionDto } from '../dto/create-survey-version.dto';

@ApiTags('Admin - Surveys')
@ApiBearerAuth()
@Controller('admin/surveys')
export class AdminSurveyController {
  constructor(
    private readonly createSurveyUseCase: CreateSurveyUseCase,
    private readonly createSurveyVersionUseCase: CreateSurveyVersionUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new survey' })
  async createSurvey(@Body() dto: CreateSurveyDto) {
    const result = await this.createSurveyUseCase.execute(dto);

    if (result.isFailure) {
      throw new Error(result.error);
    }

    return result.getValue();
  }

  @Post('versions')
  @ApiOperation({ summary: 'Create a new survey version with questions' })
  async createSurveyVersion(@Body() dto: CreateSurveyVersionDto) {
    const result = await this.createSurveyVersionUseCase.execute({
      surveyId: dto.surveyId,
      effectiveDate: dto.effectiveDate,
      questions: dto.questions,
    });

    if (result.isFailure) {
      throw new Error(result.error);
    }

    return result.getValue();
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate a survey' })
  async activateSurvey(@Param('id') id: string) {
    // TODO: Implement UpdateSurveyUseCase
    throw new Error('Not implemented yet');
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a survey' })
  async deactivateSurvey(@Param('id') id: string) {
    // TODO: Implement UpdateSurveyUseCase
    throw new Error('Not implemented yet');
  }

  @Get()
  @ApiOperation({ summary: 'Get all surveys' })
  async getAllSurveys() {
    // TODO: Implement GetAllSurveysUseCase
    throw new Error('Not implemented yet');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get survey details' })
  async getSurveyById(@Param('id') id: string) {
    // TODO: Implement GetSurveyDetailsUseCase
    throw new Error('Not implemented yet');
  }
}

