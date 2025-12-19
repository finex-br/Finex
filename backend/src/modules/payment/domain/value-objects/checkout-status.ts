import { Result } from '../../../../shared/core/result';
import { ValueObject } from '../../../../shared/core/value-object';

export enum CheckoutStatusEnum {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  RECEIVED = 'RECEIVED',
  OVERDUE = 'OVERDUE',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

interface CheckoutStatusProps {
  value: string;
}

/**
 * CheckoutStatus Value Object
 * Represents the current status of a checkout/payment
 */
export class CheckoutStatus extends ValueObject<CheckoutStatusProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: CheckoutStatusProps) {
    super(props);
  }

  public static create(status: string): Result<CheckoutStatus> {
    if (!status || status.trim().length === 0) {
      return Result.fail<CheckoutStatus>('Checkout status is required');
    }

    const normalizedStatus = status.trim().toUpperCase();

    if (!Object.values(CheckoutStatusEnum).includes(normalizedStatus as CheckoutStatusEnum)) {
      return Result.fail<CheckoutStatus>(
        `Invalid checkout status. Valid statuses: ${Object.values(CheckoutStatusEnum).join(', ')}`
      );
    }

    return Result.ok<CheckoutStatus>(
      new CheckoutStatus({ value: normalizedStatus })
    );
  }

  public isPending(): boolean {
    return this.props.value === CheckoutStatusEnum.PENDING;
  }

  public isConfirmed(): boolean {
    return this.props.value === CheckoutStatusEnum.CONFIRMED;
  }

  public isReceived(): boolean {
    return this.props.value === CheckoutStatusEnum.RECEIVED;
  }

  public isOverdue(): boolean {
    return this.props.value === CheckoutStatusEnum.OVERDUE;
  }

  public isRefunded(): boolean {
    return this.props.value === CheckoutStatusEnum.REFUNDED;
  }

  public isCancelled(): boolean {
    return this.props.value === CheckoutStatusEnum.CANCELLED;
  }

  public canBeCancelled(): boolean {
    return this.isPending() || this.isOverdue();
  }

  public canBeRefunded(): boolean {
    return this.isConfirmed() || this.isReceived();
  }
}
