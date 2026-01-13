import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CheckoutSchema } from './infrastructure/persistence/typeorm/schemas/checkout.schema';
import { CheckoutRepository } from './infrastructure/persistence/typeorm/checkout.repository';
import { AsaasPaymentProvider } from './infrastructure/providers/asaas-payment.provider';
import { CreateCheckoutUseCase } from './application/use-cases/create-checkout.use-case';
import { PaymentController } from './presentation/payment.controller';
import { AsaasWebhookController } from './presentation/asaas-webhook.controller';
import { JwtAuthGuard } from '../authentication/presentation/http/guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckoutSchema]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [PaymentController, AsaasWebhookController],
  providers: [
    JwtAuthGuard,
    CheckoutRepository,
    {
      provide: 'ICheckoutRepository',
      useExisting: CheckoutRepository,
    },
    {
      provide: AsaasPaymentProvider,
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('ASAAS_API_KEY');
        if (!apiKey) {
          throw new Error('ASAAS_API_KEY is required');
        }
        const environment = configService.get<string>('ASAAS_ENVIRONMENT', 'sandbox');
        return new AsaasPaymentProvider(apiKey, environment);
      },
      inject: [ConfigService],
    },
    {
      provide: 'IPaymentProvider',
      useExisting: AsaasPaymentProvider,
    },
    CreateCheckoutUseCase,
  ],
  exports: [CheckoutRepository, 'ICheckoutRepository'],
})
export class PaymentModule {}
