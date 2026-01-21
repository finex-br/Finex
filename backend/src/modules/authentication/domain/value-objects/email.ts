import { ValueObject } from '../../../../shared/core/value-object';
import { Result } from '../../../../shared/core/result';

interface EmailProps {
  value: string;
}

/**
 * Email Value Object
 * Ensures email is valid
 */
export class Email extends ValueObject<EmailProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: EmailProps) {
    super(props);
  }

  private static isValidEmail(email: string): boolean {
    // RFC 5322 compliant regex (simplified)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public static create(email: string): Result<Email> {
    // Check for null or undefined
    if (email === null || email === undefined) {
      return Result.fail<Email>('Email is required');
    }

    // Check if email is a string
    if (typeof email !== 'string') {
      return Result.fail<Email>('Email must be a string');
    }

    // Normalize: trim and lowercase
    const normalizedEmail = email.trim().toLowerCase();

    // Check for empty string
    if (normalizedEmail.length === 0) {
      return Result.fail<Email>('Email is required');
    }

    // Validate email format
    if (!this.isValidEmail(normalizedEmail)) {
      return Result.fail<Email>('Email format is invalid');
    }

    return Result.ok<Email>(new Email({ value: normalizedEmail }));
  }
}
