import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CheckoutSchema } from './infrastructure/persistence/typeorm/schemas/checkout.schema';
import { CheckoutRepository } from './infrastructure/persistence/typeorm/checkout.repository';
import { AsaasPaymentProvider } from './infrastructure/providers/asaas-payment.provider';
import { CreateCheckoutUseCase } from './application/use-cases/create-checkout.use-case';
import { PaymentController } from './presentation/payment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckoutSchema]),
    ConfigModule,
  ],
  controllers: [PaymentController],
  providers: [
    CheckoutRepository,
    {
      provide: 'ICheckoutRepository',
      useExisting: CheckoutRepository,
    },
    {
      provide: AsaasPaymentProvider,
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('ASAAS_API_KEY');
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
