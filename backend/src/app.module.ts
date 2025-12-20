import { Module, Controller, Get } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvModule, EnvService } from './shared/infra/env';
import { AuthenticationModule } from './modules/authentication/infrastructure/authentication.module';
import { FinancialModule } from './modules/financial/financial.module';
import { PaymentModule } from './modules/payment/payment.module';

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
        synchronize: envService.nodeEnv === 'development',
        logging: envService.nodeEnv === 'development',
      }),
    }),
    AuthenticationModule,
    FinancialModule,
    PaymentModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
