import { Controller, Post, Get, Param, Query, Body, UseGuards, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StartAssessmentUseCase } from '../../application/use-cases/start-assessment/start-assessment.use-case';
import { GetQuestionsUseCase } from '../../application/use-cases/get-questions/get-questions.use-case';
import { SubmitAnswersUseCase } from '../../application/use-cases/submit-answers/submit-answers.use-case';
import { CompleteAssessmentUseCase } from '../../application/use-cases/complete-assessment/complete-assessment.use-case';
import { GetPendingAssessmentsUseCase } from '../../application/use-cases/get-pending-assessments/get-pending-assessments.use-case';
import { StartAssessmentDto } from '../dto/start-assessment.dto';
import { SubmitAnswersDto } from '../dto/submit-answers.dto';
import { DataSource } from 'typeorm';

@ApiTags('User - Surveys')
@ApiBearerAuth()
@Controller('surveys')
export class UserSurveyController {
  constructor(
    private readonly startAssessmentUseCase: StartAssessmentUseCase,
    private readonly getQuestionsUseCase: GetQuestionsUseCase,
    private readonly submitAnswersUseCase: SubmitAnswersUseCase,
    private readonly completeAssessmentUseCase: CompleteAssessmentUseCase,
    private readonly getPendingAssessmentsUseCase: GetPendingAssessmentsUseCase,
    private readonly dataSource: DataSource,
  ) {}

  private extractUserIdFromToken(authorization: string): string {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authorization.substring(7);
    try {
      // Decode JWT without verification (temporary solution)
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
      // JWT usa 'sub' (subject) como campo padrao para userId
      const userId = payload.sub || payload.userId;
      return userId;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async getCompanyIdForUser(userId: string): Promise<string> {
    const result = await this.dataSource.query(
      'SELECT company_id FROM company_members WHERE user_id = $1 AND is_active = true LIMIT 1',
      [userId]
    );

    if (!result || result.length === 0) {
      throw new Error('User is not associated with any company');
    }

    return result[0].company_id;
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending surveys for company' })
  async getPendingAssessments(@Headers('authorization') authorization: string) {
    const userId = this.extractUserIdFromToken(authorization);
    const companyId = await this.getCompanyIdForUser(userId);

    const result = await this.getPendingAssessmentsUseCase.execute({ companyId });

    if (result.isFailure) {
      throw new Error(result.error);
    }

    return result.getValue();
  }

  @Post(':surveyId/start')
  @ApiOperation({ summary: 'Start or resume assessment' })
  async startAssessment(
    @Param('surveyId') surveyId: string,
    @Headers('authorization') authorization: string,
  ) {
    const userId = this.extractUserIdFromToken(authorization);
    const companyId = await this.getCompanyIdForUser(userId);

    const result = await this.startAssessmentUseCase.execute({
      companyId,
      surveyId,
    });

    if (result.isFailure) {
      throw new Error(result.error);
    }

    return result.getValue();
  }

  @Get('assessments/:assessmentId/questions')
  @ApiOperation({ summary: 'Get questions for assessment (paginated)' })
  async getQuestions(
    @Param('assessmentId') assessmentId: string,
    @Query('page') page: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    
    const result = await this.getQuestionsUseCase.execute({
      assessmentId,
      page: pageNumber,
    });

    if (result.isFailure) {
      throw new Error(result.error);
    }

    return result.getValue();
  }

  @Post('assessments/:assessmentId/answers')
  @ApiOperation({ summary: 'Submit answers for assessment' })
  async submitAnswers(
    @Param('assessmentId') assessmentId: string,
    @Body() dto: SubmitAnswersDto,
  ) {
    const result = await this.submitAnswersUseCase.execute({
      assessmentId,
      answers: dto.answers,
    });

    if (result.isFailure) {
      throw new Error(result.error);
    }

    return result.getValue();
  }

  @Post('assessments/:assessmentId/complete')
  @ApiOperation({ summary: 'Complete assessment' })
  async completeAssessment(@Param('assessmentId') assessmentId: string) {
    const result = await this.completeAssessmentUseCase.execute({ assessmentId });

    if (result.isFailure) {
      throw new Error(result.error);
    }

    return result.getValue();
  }

  @Get('assessments/:assessmentId/progress')
  @ApiOperation({ summary: 'Get assessment progress' })
  async getProgress(@Param('assessmentId') assessmentId: string) {
    // TODO: Implement GetAssessmentProgressUseCase or reuse existing logic
    throw new Error('Not implemented yet');
  }
}
