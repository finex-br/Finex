import { Entity } from '../../../../shared/core/entity';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';
import { Result } from '../../../../shared/core/result';
import { Amount } from '../value-objects/amount';
import { CheckoutStatus, CheckoutStatusEnum } from '../value-objects/checkout-status';

interface CheckoutProps {
  userId: string;
  amount: Amount;
  description: string;
  status: CheckoutStatus;
  asaasCheckoutId?: string;
  asaasPaymentId?: string;
  checkoutUrl?: string;
  maxInstallments?: number;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  expiresAt?: Date;
}

/**
 * Checkout Entity (Aggregate Root)
 * Represents a payment checkout in the system
 */
export class Checkout extends Entity<CheckoutProps> {
  get userId(): string {
    return this.props.userId;
  }

  get amount(): Amount {
    return this.props.amount;
  }

  get description(): string {
    return this.props.description;
  }

  get status(): CheckoutStatus {
    return this.props.status;
  }

  get asaasCheckoutId(): string | undefined {
    return this.props.asaasCheckoutId;
  }

  get asaasPaymentId(): string | undefined {
    return this.props.asaasPaymentId;
  }

  get checkoutUrl(): string | undefined {
    return this.props.checkoutUrl;
  }

  get maxInstallments(): number | undefined {
    return this.props.maxInstallments;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get paidAt(): Date | undefined {
    return this.props.paidAt;
  }

  get expiresAt(): Date | undefined {
    return this.props.expiresAt;
  }

  private constructor(props: CheckoutProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: CheckoutProps, id?: UniqueEntityID): Result<Checkout> {
    // Validations
    if (!props.userId) {
      return Result.fail<Checkout>('User ID is required');
    }

    if (!props.amount) {
      return Result.fail<Checkout>('Amount is required');
    }

    if (!props.description || props.description.trim().length === 0) {
      return Result.fail<Checkout>('Description is required');
    }

    if (props.description.length > 500) {
      return Result.fail<Checkout>('Description must be less than 500 characters');
    }

    if (!props.status) {
      return Result.fail<Checkout>('Status is required');
    }

    if (props.maxInstallments && (props.maxInstallments < 1 || props.maxInstallments > 12)) {
      return Result.fail<Checkout>('Max installments must be between 1 and 12');
    }

    // Set default dates if not provided
    const createdAt = props.createdAt || new Date();
    const updatedAt = props.updatedAt || new Date();

    const checkout = new Checkout(
      {
        ...props,
        createdAt,
        updatedAt,
      },
      id,
    );

    return Result.ok<Checkout>(checkout);
  }

  public confirm(asaasPaymentId: string): Result<void> {
    if (!this.status.isPending()) {
      return Result.fail<void>('Can only confirm pending checkouts');
    }

    const confirmedStatus = CheckoutStatus.create(CheckoutStatusEnum.CONFIRMED);
    if (confirmedStatus.isFailure) {
      return Result.fail<void>(confirmedStatus.error || 'Failed to create confirmed status');
    }

    this.props.status = confirmedStatus.getValue();
    this.props.asaasPaymentId = asaasPaymentId;
    this.props.paidAt = new Date();
    this.props.updatedAt = new Date();

    return Result.ok<void>();
  }

  public markAsReceived(): Result<void> {
    if (!this.status.isConfirmed()) {
      return Result.fail<void>('Can only mark confirmed checkouts as received');
    }

    const receivedStatus = CheckoutStatus.create(CheckoutStatusEnum.RECEIVED);
    if (receivedStatus.isFailure) {
      return Result.fail<void>(receivedStatus.error || 'Failed to create received status');
    }

    this.props.status = receivedStatus.getValue();
    this.props.updatedAt = new Date();

    return Result.ok<void>();
  }

  public cancel(): Result<void> {
    if (!this.status.canBeCancelled()) {
      return Result.fail<void>('Cannot cancel checkout in current status');
    }

    const cancelledStatus = CheckoutStatus.create(CheckoutStatusEnum.CANCELLED);
    if (cancelledStatus.isFailure) {
      return Result.fail<void>(cancelledStatus.error || 'Failed to create cancelled status');
    }

    this.props.status = cancelledStatus.getValue();
    this.props.updatedAt = new Date();

    return Result.ok<void>();
  }

  public setAsaasCheckoutId(checkoutId: string, checkoutUrl: string): void {
    this.props.asaasCheckoutId = checkoutId;
    this.props.checkoutUrl = checkoutUrl;
    this.props.updatedAt = new Date();
  }

  public setExpirationDate(expiresAt: Date): void {
    this.props.expiresAt = expiresAt;
    this.props.updatedAt = new Date();
  }
}
