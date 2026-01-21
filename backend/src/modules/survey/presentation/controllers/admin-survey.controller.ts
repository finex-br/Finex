import { Controller, Post, Body, Get, Patch, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../authentication/presentation/http/guards/jwt-auth.guard';
import { AdminGuard } from '../../../authentication/presentation/http/guards/admin.guard';
import { CreateSurveyDto } from '../dtos/create-survey.dto';
import { CreateSurveyUseCase } from '../../application/use-cases/admin/create-survey.use-case';
import { GetAllSurveysUseCase } from '../../application/use-cases/admin/get-all-surveys.use-case';
import { GetCompletedAssessmentsUseCase } from '../../application/use-cases/admin/get-completed-assessments.use-case';
import { CreateSurveyVersionUseCase } from '../../application/use-cases/create-survey-version/create-survey-version.use-case';
import { AddQuestionUseCase } from '../../application/use-cases/admin/add-question.use-case';
import { CreateSurveyVersionDto } from '../dto/create-survey-version.dto';
import { AddQuestionViewModel } from '../view-models/admin/add-question.view-model';

@ApiTags('Admin - Surveys')
@ApiBearerAuth()
@Controller('admin/surveys')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminSurveyController {
  constructor(
    @Inject('AdminCreateSurveyUseCase')
    private readonly createSurveyUseCase: CreateSurveyUseCase,
    private readonly getAllSurveysUseCase: GetAllSurveysUseCase,
    private readonly getCompletedAssessmentsUseCase: GetCompletedAssessmentsUseCase,
    private readonly createSurveyVersionUseCase: CreateSurveyVersionUseCase,
    private readonly addQuestionUseCase: AddQuestionUseCase,
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
    const result = await this.getAllSurveysUseCase.execute();

    if (result.isFailure) {
      throw new Error(result.error);
    }

    return result.getValue();
  }

  @Get('assessments/completed')
  @ApiOperation({ summary: 'Get completed assessments with filters' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'surveyId', required: false })
  async getCompletedAssessments(
    @Query('companyId') companyId?: string,
    @Query('surveyId') surveyId?: string,
  ) {
    const result = await this.getCompletedAssessmentsUseCase.execute({
      companyId,
      surveyId,
    });

    if (result.isFailure) {
      throw new Error(result.error);
    }

    return result.getValue();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get survey details' })
  async getSurveyById(@Param('id') id: string) {
    // TODO: Implement GetSurveyDetailsUseCase
    throw new Error('Not implemented yet');
  }

  @Post('versions/:surveyVersionId/questions')
  @ApiOperation({ summary: 'Add a question to survey version' })
  async addQuestion(
    @Param('surveyVersionId') surveyVersionId: string,
    @Body() body: AddQuestionViewModel,
  ) {
    const result = await this.addQuestionUseCase.execute({
      surveyVersionId,
      text: body.text,
      type: body.type,
      options: body.options,
      orderIndex: body.orderIndex,
    });

    if (result.isFailure) {
      throw new Error(result.error);
    }

    return result.getValue();
  }
}

