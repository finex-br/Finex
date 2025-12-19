import { Result } from '../../../../shared/core/result';
import { ValueObject } from '../../../../shared/core/value-object';

interface AmountProps {
  value: number;
}

/**
 * Amount Value Object
 * Represents a monetary amount in BRL
 */
export class Amount extends ValueObject<AmountProps> {
  get value(): number {
    return this.props.value;
  }

  private constructor(props: AmountProps) {
    super(props);
  }

  public static create(amount: number): Result<Amount> {
    if (amount === null || amount === undefined) {
      return Result.fail<Amount>('Amount is required');
    }

    if (amount < 0) {
      return Result.fail<Amount>('Amount cannot be negative');
    }

    if (amount === 0) {
      return Result.fail<Amount>('Amount must be greater than zero');
    }

    if (amount > 999999.99) {
      return Result.fail<Amount>('Amount exceeds maximum allowed value');
    }

    // Round to 2 decimal places
    const roundedAmount = Math.round(amount * 100) / 100;

    return Result.ok<Amount>(new Amount({ value: roundedAmount }));
  }

  public static zero(): Amount {
    return new Amount({ value: 0 });
  }

  public add(other: Amount): Amount {
    return new Amount({ value: this.value + other.value });
  }

  public subtract(other: Amount): Result<Amount> {
    const newValue = this.value - other.value;
    if (newValue < 0) {
      return Result.fail<Amount>('Result would be negative');
    }
    return Result.ok<Amount>(new Amount({ value: newValue }));
  }

  public multiply(factor: number): Amount {
    return new Amount({ value: Math.round(this.value * factor * 100) / 100 });
  }

  public isGreaterThan(other: Amount): boolean {
    return this.value > other.value;
  }

  public isLessThan(other: Amount): boolean {
    return this.value < other.value;
  }

  public equals(other: Amount): boolean {
    return Math.abs(this.value - other.value) < 0.01;
  }
}
