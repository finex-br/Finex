import { ValueObject } from '../../../../shared/core/value-object';
import { Result } from '../../../../shared/core/result';

interface PhoneNumberProps {
  value: string;
}

/**
 * PhoneNumber Value Object
 * Represents a Brazilian phone number with validation
 * Stores in E.164 format: +5511987654321
 */
export class PhoneNumber extends ValueObject<PhoneNumberProps> {
  private constructor(props: PhoneNumberProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  /**
   * Creates a PhoneNumber from a string
   * Accepts formats:
   * - +5511987654321
   * - 11987654321
   * - (11) 98765-4321
   * - +55 (11) 9 8765-4321
   */
  public static create(phone: string): Result<PhoneNumber> {
    if (!phone || phone.trim().length === 0) {
      return Result.fail<PhoneNumber>('Phone number is required');
    }

    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');

    // Remove country code if present (55 for Brazil)
    let nationalNumber = digitsOnly;
    if (digitsOnly.startsWith('55') && digitsOnly.length > 11) {
      nationalNumber = digitsOnly.substring(2);
    }

    // Validate Brazilian phone number (10 or 11 digits)
    // 10 digits: landline (XX XXXX-XXXX)
    // 11 digits: mobile (XX 9XXXX-XXXX)
    if (nationalNumber.length < 10 || nationalNumber.length > 11) {
      return Result.fail<PhoneNumber>('Phone number is invalid. Must have 10 or 11 digits');
    }

    // Validate area code (first 2 digits must be between 11-99)
    const areaCode = parseInt(nationalNumber.substring(0, 2));
    if (areaCode < 11 || areaCode > 99) {
      return Result.fail<PhoneNumber>('Phone number has invalid area code');
    }

    // Store in E.164 format with country code
    const e164Format = `+55${nationalNumber}`;

    return Result.ok<PhoneNumber>(
      new PhoneNumber({ value: e164Format })
    );
  }

  /**
   * Returns formatted phone number for display
   * (XX) XXXXX-XXXX or (XX) XXXX-XXXX
   */
  public getFormatted(): string {
    // Remove country code
    const national = this.value.substring(3); // Remove +55
    const areaCode = national.substring(0, 2);
    const remaining = national.substring(2);

    if (remaining.length === 9) {
      // Mobile: (XX) 9XXXX-XXXX
      return `(${areaCode}) ${remaining.substring(0, 5)}-${remaining.substring(5)}`;
    } else {
      // Landline: (XX) XXXX-XXXX
      return `(${areaCode}) ${remaining.substring(0, 4)}-${remaining.substring(4)}`;
    }
  }

  public equals(vo?: ValueObject<PhoneNumberProps>): boolean {
    if (!vo || !(vo instanceof PhoneNumber)) {
      return false;
    }
    return this.value === vo.value;
  }
}
