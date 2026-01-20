import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StartAssessmentUseCase } from '../../application/use-cases/start-assessment/start-assessment.use-case';
import { GetQuestionsUseCase } from '../../application/use-cases/get-questions/get-questions.use-case';
import { SubmitAnswersUseCase } from '../../application/use-cases/submit-answers/submit-answers.use-case';
import { CompleteAssessmentUseCase } from '../../application/use-cases/complete-assessment/complete-assessment.use-case';
import { GetPendingAssessmentsUseCase } from '../../application/use-cases/get-pending-assessments/get-pending-assessments.use-case';
import { SubmitAnswersDto } from '../dto/submit-answers.dto';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '../../../authentication/presentation/http/guards/jwt-auth.guard';
import { resolveCompanyContext } from '../../../../shared/tenant/company-context';

@ApiTags('User - Surveys')
@ApiBearerAuth()
@Controller('surveys')
@UseGuards(JwtAuthGuard)
export class UserSurveyController {
  constructor(
    private readonly startAssessmentUseCase: StartAssessmentUseCase,
    private readonly getQuestionsUseCase: GetQuestionsUseCase,
    private readonly submitAnswersUseCase: SubmitAnswersUseCase,
    private readonly completeAssessmentUseCase: CompleteAssessmentUseCase,
    private readonly getPendingAssessmentsUseCase: GetPendingAssessmentsUseCase,
    private readonly dataSource: DataSource,
  ) {}

  private isSystemAdmin(req: any): boolean {
    return String(req.user?.role || '').toUpperCase() === 'ADMIN';
  }

  private async resolveCompanyId(req: any, requestedCompanyId?: string): Promise<string> {
    const ctx = await resolveCompanyContext(this.dataSource, req, requestedCompanyId, {
      requireCompanyIdForAdmin: true,
    });

    if (!ctx.companyId) {
      throw new HttpException('Company context not resolved', HttpStatus.BAD_REQUEST);
    }

    return ctx.companyId;
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending surveys for company' })
  async getPendingAssessments(
    @Request() req: any,
    @Headers('x-company-id') xCompanyId?: string,
  ) {
    const companyId = await this.resolveCompanyId(req, xCompanyId);

    const result = await this.getPendingAssessmentsUseCase.execute({ companyId });

    if (result.isFailure) {
      throw new HttpException(result.error ?? 'Failed to load pending assessments', HttpStatus.BAD_REQUEST);
    }

    return result.getValue();
  }

  @Post(':surveyId/start')
  @ApiOperation({ summary: 'Start or resume assessment' })
  async startAssessment(
    @Param('surveyId') surveyId: string,
    @Request() req: any,
    @Headers('x-company-id') xCompanyId?: string,
  ) {
    const companyId = await this.resolveCompanyId(req, xCompanyId);

    const result = await this.startAssessmentUseCase.execute({
      companyId,
      surveyId,
    });

    if (result.isFailure) {
      throw new HttpException(result.error ?? 'Failed to start assessment', HttpStatus.BAD_REQUEST);
    }

    return result.getValue();
  }

  @Get('assessments/:assessmentId/questions')
  @ApiOperation({ summary: 'Get questions for assessment (paginated)' })
  async getQuestions(
    @Param('assessmentId') assessmentId: string,
    @Query('page') page: string,
    @Request() req: any,
    @Headers('x-company-id') xCompanyId?: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;

    const companyId = await this.resolveCompanyId(req, xCompanyId);
    
    const result = await this.getQuestionsUseCase.execute({
      assessmentId,
      companyId,
      page: pageNumber,
    });

    if (result.isFailure) {
      throw new HttpException(result.error ?? 'Failed to get questions', HttpStatus.BAD_REQUEST);
    }

    return result.getValue();
  }

  @Post('assessments/:assessmentId/answers')
  @ApiOperation({ summary: 'Submit answers for assessment' })
  async submitAnswers(
    @Param('assessmentId') assessmentId: string,
    @Body() dto: SubmitAnswersDto,
    @Request() req: any,
    @Headers('x-company-id') xCompanyId?: string,
  ) {
    const companyId = await this.resolveCompanyId(req, xCompanyId);

    const result = await this.submitAnswersUseCase.execute({
      assessmentId,
      companyId,
      answers: dto.answers,
    });

    if (result.isFailure) {
      throw new HttpException(result.error ?? 'Failed to submit answers', HttpStatus.BAD_REQUEST);
    }

    return result.getValue();
  }

  @Post('assessments/:assessmentId/complete')
  @ApiOperation({ summary: 'Complete assessment' })
  async completeAssessment(
    @Param('assessmentId') assessmentId: string,
    @Request() req: any,
    @Headers('x-company-id') xCompanyId?: string,
  ) {
    const companyId = await this.resolveCompanyId(req, xCompanyId);

    const result = await this.completeAssessmentUseCase.execute({ assessmentId, companyId });

    if (result.isFailure) {
      throw new HttpException(result.error ?? 'Failed to complete assessment', HttpStatus.BAD_REQUEST);
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
