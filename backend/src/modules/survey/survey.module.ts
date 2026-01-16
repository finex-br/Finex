import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Schemas
import { SurveySchema } from './infrastructure/database/entities/survey.schema';
import { SurveyVersionSchema } from './infrastructure/database/entities/survey-version.schema';
import { QuestionSchema } from './infrastructure/database/entities/question.schema';
import { AssessmentSchema } from './infrastructure/database/entities/assessment.schema';
import { AnswerSchema } from './infrastructure/database/entities/answer.schema';

// Repositories
import { TypeORMSurveyRepository } from './infrastructure/database/repositories/typeorm-survey.repository';
import { TypeORMSurveyVersionRepository } from './infrastructure/database/repositories/typeorm-survey-version.repository';
import { TypeORMQuestionRepository } from './infrastructure/database/repositories/typeorm-question.repository';
import { TypeORMAssessmentRepository } from './infrastructure/database/repositories/typeorm-assessment.repository';
import { TypeORMAnswerRepository } from './infrastructure/database/repositories/typeorm-answer.repository';
import { ISurveyRepository } from './domain/repositories/survey.repository.interface';
import { ISurveyVersionRepository } from './domain/repositories/survey-version.repository.interface';
import { IQuestionRepository } from './domain/repositories/question.repository.interface';
import { IAssessmentRepository } from './domain/repositories/assessment.repository.interface';
import { IAnswerRepository } from './domain/repositories/answer.repository.interface';

// Use Cases
import { CreateSurveyUseCase as AdminCreateSurveyUseCase } from './application/use-cases/admin/create-survey.use-case';
import { CreateSurveyVersionUseCase } from './application/use-cases/create-survey-version/create-survey-version.use-case';
import { StartAssessmentUseCase } from './application/use-cases/start-assessment/start-assessment.use-case';
import { GetQuestionsUseCase } from './application/use-cases/get-questions/get-questions.use-case';
import { SubmitAnswersUseCase } from './application/use-cases/submit-answers/submit-answers.use-case';
import { CompleteAssessmentUseCase } from './application/use-cases/complete-assessment/complete-assessment.use-case';
import { GetPendingAssessmentsUseCase } from './application/use-cases/get-pending-assessments/get-pending-assessments.use-case';
import { AddQuestionUseCase } from './application/use-cases/admin/add-question.use-case';

// Controllers
import { AdminSurveyController } from './presentation/controllers/admin-survey.controller';
import { UserSurveyController } from './presentation/controllers/user-survey.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SurveySchema,
      SurveyVersionSchema,
      QuestionSchema,
      AssessmentSchema,
      AnswerSchema,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AdminSurveyController, UserSurveyController],
  providers: [
    // Repositories
    {
      provide: 'ISurveyRepository',
      useClass: TypeORMSurveyRepository,
    },
    {
      provide: 'ISurveyVersionRepository',
      useClass: TypeORMSurveyVersionRepository,
    },
    {
      provide: 'IQuestionRepository',
      useClass: TypeORMQuestionRepository,
    },
    {
      provide: 'IAssessmentRepository',
      useClass: TypeORMAssessmentRepository,
    },
    {
      provide: 'IAnswerRepository',
      useClass: TypeORMAnswerRepository,
    },
    
    // Use Cases
    {
      provide: 'AdminCreateSurveyUseCase',
      useFactory: (
        surveyRepo: ISurveyRepository,
        versionRepo: ISurveyVersionRepository,
      ) => {
        return new AdminCreateSurveyUseCase(surveyRepo, versionRepo);
      },
      inject: ['ISurveyRepository', 'ISurveyVersionRepository'],
    },
    {
      provide: CreateSurveyVersionUseCase,
      useFactory: (
        surveyRepo: ISurveyRepository,
        versionRepo: ISurveyVersionRepository,
        questionRepo: IQuestionRepository,
      ) => {
        return new CreateSurveyVersionUseCase(surveyRepo, versionRepo, questionRepo);
      },
      inject: ['ISurveyRepository', 'ISurveyVersionRepository', 'IQuestionRepository'],
    },
    {
      provide: StartAssessmentUseCase,
      useFactory: (
        assessmentRepo: IAssessmentRepository,
        versionRepo: ISurveyVersionRepository,
        surveyRepo: ISurveyRepository,
        questionRepo: IQuestionRepository,
        answerRepo: IAnswerRepository,
      ) => {
        return new StartAssessmentUseCase(
          assessmentRepo,
          versionRepo,
          surveyRepo,
          questionRepo,
          answerRepo,
        );
      },
      inject: [
        'IAssessmentRepository',
        'ISurveyVersionRepository',
        'ISurveyRepository',
        'IQuestionRepository',
        'IAnswerRepository',
      ],
    },
    {
      provide: GetQuestionsUseCase,
      useFactory: (
        assessmentRepo: IAssessmentRepository,
        questionRepo: IQuestionRepository,
        answerRepo: IAnswerRepository,
      ) => {
        return new GetQuestionsUseCase(assessmentRepo, questionRepo, answerRepo);
      },
      inject: ['IAssessmentRepository', 'IQuestionRepository', 'IAnswerRepository'],
    },
    {
      provide: SubmitAnswersUseCase,
      useFactory: (
        assessmentRepo: IAssessmentRepository,
        questionRepo: IQuestionRepository,
        answerRepo: IAnswerRepository,
      ) => {
        return new SubmitAnswersUseCase(assessmentRepo, questionRepo, answerRepo);
      },
      inject: ['IAssessmentRepository', 'IQuestionRepository', 'IAnswerRepository'],
    },
    {
      provide: CompleteAssessmentUseCase,
      useFactory: (
        assessmentRepo: IAssessmentRepository,
        questionRepo: IQuestionRepository,
        answerRepo: IAnswerRepository,
      ) => {
        return new CompleteAssessmentUseCase(assessmentRepo, questionRepo, answerRepo);
      },
      inject: ['IAssessmentRepository', 'IQuestionRepository', 'IAnswerRepository'],
    },
    {
      provide: GetPendingAssessmentsUseCase,
      useFactory: (
        surveyRepo: ISurveyRepository,
        versionRepo: ISurveyVersionRepository,
        assessmentRepo: IAssessmentRepository,
      ) => {
        return new GetPendingAssessmentsUseCase(surveyRepo, versionRepo, assessmentRepo);
      },
      inject: ['ISurveyRepository', 'ISurveyVersionRepository', 'IAssessmentRepository'],
    },
    {
      provide: AddQuestionUseCase,
      useFactory: (
        questionRepo: IQuestionRepository,
        versionRepo: ISurveyVersionRepository,
      ) => {
        return new AddQuestionUseCase(questionRepo, versionRepo);
      },
      inject: ['IQuestionRepository', 'ISurveyVersionRepository'],
    },
  ],
  exports: [],
})
export class SurveyModule {}

