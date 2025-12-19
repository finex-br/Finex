import { IUseCase } from '../../../../shared/core/use-case.interface';
import { Result } from '../../../../shared/core/result';
import { ICheckoutRepository } from '../../domain/ports/checkout-repository.interface';
import { IPaymentProvider } from '../../domain/ports/payment-provider.interface';
import { CreateCheckoutDTO } from '../dtos/create-checkout.dto';
import { CheckoutResponseDTO } from '../dtos/checkout-response.dto';
import { Checkout } from '../../domain/entities/checkout';
import { Amount } from '../../domain/value-objects/amount';
import { CheckoutStatus } from '../../domain/value-objects/checkout-status';

/**
 * Create Checkout Use Case
 * Creates a new payment checkout session with Asaas
 */
export class CreateCheckoutUseCase
  implements IUseCase<CreateCheckoutDTO, Result<CheckoutResponseDTO>>
{
  constructor(
    private readonly checkoutRepository: ICheckoutRepository,
    private readonly paymentProvider: IPaymentProvider,
  ) {}

  async execute(request: CreateCheckoutDTO): Promise<Result<CheckoutResponseDTO>> {
    try {
      // 1. Validate and create value objects
      const amountOrError = Amount.create(request.amount);
      if (amountOrError.isFailure) {
        return Result.fail<CheckoutResponseDTO>(amountOrError.error || 'Invalid amount');
      }

      const statusOrError = CheckoutStatus.create('PENDING');
      if (statusOrError.isFailure) {
        return Result.fail<CheckoutResponseDTO>(statusOrError.error || 'Invalid status');
      }

      // 2. Create checkout entity
      const checkoutOrError = Checkout.create({
        userId: request.userId,
        amount: amountOrError.getValue(),
        description: request.description,
        status: statusOrError.getValue(),
        maxInstallments: request.maxInstallments,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (checkoutOrError.isFailure) {
        return Result.fail<CheckoutResponseDTO>(checkoutOrError.error || 'Failed to create checkout');
      }

      const checkout = checkoutOrError.getValue();

      // 3. Create checkout in payment provider (Asaas)
      const asaasResponse = await this.paymentProvider.createCheckout({
        amount: request.amount,
        description: request.description,
        customerName: request.customerName,
        customerEmail: request.customerEmail,
        customerCpfCnpj: request.customerCpfCnpj,
        maxInstallments: request.maxInstallments,
        minutesToExpire: request.minutesToExpire,
        successUrl: request.successUrl,
        cancelUrl: request.cancelUrl,
      });

      // 4. Update checkout with Asaas data
      checkout.setAsaasCheckoutId(asaasResponse.id, asaasResponse.url);
      
      if (asaasResponse.expirationDate) {
        checkout.setExpirationDate(new Date(asaasResponse.expirationDate));
      }

      // 5. Save checkout
      await this.checkoutRepository.save(checkout);

      // 6. Return response
      return Result.ok<CheckoutResponseDTO>({
        checkoutId: checkout.id.toString(),
        checkoutUrl: asaasResponse.url,
        amount: checkout.amount.value,
        description: checkout.description,
        status: checkout.status.value,
        expiresAt: checkout.expiresAt,
      });
    } catch (error) {
      return Result.fail<CheckoutResponseDTO>(
        `Failed to create checkout: ${error.message}`,
      );
    }
  }
}
