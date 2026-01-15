import { Module, Controller, Get } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvModule, EnvService } from './shared/infra/env';
import { AuthenticationModule } from './modules/authentication/infrastructure/authentication.module';
import { CompanyModule } from './modules/company/company.module';
import { FinancialModule } from './modules/financial/financial.module';
import { PaymentModule } from './modules/payment/payment.module';
import { SurveyModule } from './modules/survey/survey.module';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

@Module({
  imports: [
    EnvModule,
    TypeOrmModule.forRootAsync({
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        type: 'postgres',
        url: envService.databaseUrl,
        entities: [__dirname + '/**/*.schema{.ts,.js}'],
        synchronize: false,
        logging: envService.nodeEnv === 'development',
        ssl: false, // Desabilita SSL para desenvolvimento local
        extra: {
          max: 10,
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 30000,
        },
      }),
    }),
    AuthenticationModule,
    CompanyModule,
    FinancialModule,
    PaymentModule,
    SurveyModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
