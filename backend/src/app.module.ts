import { Module, Controller, Get } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvModule, EnvService } from './shared/infra/env';
import { AuthenticationModule } from './modules/authentication/infrastructure/authentication.module';
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
        synchronize: false, // Desabilitado - usamos migrations ou SQL scripts
        logging: envService.nodeEnv === 'development',
      }),
    }),
    AuthenticationModule,
    PaymentModule,
    SurveyModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
