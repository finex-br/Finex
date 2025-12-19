import { Checkout } from '../../../domain/entities/checkout';
import { CheckoutSchema } from '../typeorm/schemas/checkout.schema';
import { Amount } from '../../../domain/value-objects/amount';
import { CheckoutStatus } from '../../../domain/value-objects/checkout-status';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';

export class CheckoutMapper {
  static toDomain(schema: CheckoutSchema): Checkout {
    const amountOrError = Amount.create(schema.amount);
    const statusOrError = CheckoutStatus.create(schema.status);

    if (amountOrError.isFailure || statusOrError.isFailure) {
      throw new Error('Invalid checkout data from database');
    }

    const checkoutOrError = Checkout.create(
      {
        userId: schema.userId,
        amount: amountOrError.getValue(),
        description: schema.description,
        status: statusOrError.getValue(),
        asaasCheckoutId: schema.asaasCheckoutId,
        asaasPaymentId: schema.asaasPaymentId,
        checkoutUrl: schema.checkoutUrl,
        maxInstallments: schema.maxInstallments,
        createdAt: schema.createdAt,
        updatedAt: schema.updatedAt,
        paidAt: schema.paidAt,
        expiresAt: schema.expiresAt,
      },
      new UniqueEntityID(schema.id),
    );

    if (checkoutOrError.isFailure) {
      throw new Error(checkoutOrError.error || 'Failed to map checkout from database');
    }

    return checkoutOrError.getValue();
  }

  static toPersistence(checkout: Checkout): CheckoutSchema {
    const schema = new CheckoutSchema();
    
    schema.id = checkout.id.toString();
    schema.userId = checkout.userId;
    schema.amount = checkout.amount.value;
    schema.description = checkout.description;
    schema.status = checkout.status.value;
    schema.asaasCheckoutId = checkout.asaasCheckoutId;
    schema.asaasPaymentId = checkout.asaasPaymentId;
    schema.checkoutUrl = checkout.checkoutUrl;
    schema.maxInstallments = checkout.maxInstallments;
    schema.createdAt = checkout.createdAt;
    schema.updatedAt = checkout.updatedAt;
    schema.paidAt = checkout.paidAt;
    schema.expiresAt = checkout.expiresAt;

    return schema;
  }
}
