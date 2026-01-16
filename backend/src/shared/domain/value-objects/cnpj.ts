import { ValueObject } from '../../core/value-object';
import { Result } from '../../core/result';

interface CNPJProps {
  value: string;
}

/**
 * CNPJ Value Object
 * Represents a Brazilian company registration number (Cadastro Nacional da Pessoa Jurídica)
 * Validates format and check digits
 * Stores in formatted format: XX.XXX.XXX/XXXX-XX
 */
export class CNPJ extends ValueObject<CNPJProps> {
  private constructor(props: CNPJProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  /**
   * Creates a CNPJ from a string
   * Accepts formats:
   * - 12.345.678/0001-90
   * - 12345678000190
   * - 12.345.678/000190
   * - Any mix of formatted/unformatted
   */
  public static create(cnpj: string | undefined): Result<CNPJ> {
    // CNPJ is optional, allow undefined or empty
    if (!cnpj || cnpj.trim().length === 0) {
      return Result.fail<CNPJ>('CNPJ cannot be empty');
    }

    // Remove all non-digit characters
    const digitsOnly = cnpj.replace(/\D/g, '');

    // Validate length (must be exactly 14 digits)
    if (digitsOnly.length !== 14) {
      return Result.fail<CNPJ>('CNPJ must have exactly 14 digits');
    }

    // Validate if all digits are the same (invalid CNPJs)
    if (/^(\d)\1{13}$/.test(digitsOnly)) {
      return Result.fail<CNPJ>('CNPJ cannot have all digits the same');
    }

    // Validate check digits
    if (!this.validateCheckDigits(digitsOnly)) {
      return Result.fail<CNPJ>('CNPJ has invalid check digits');
    }

    // Format: XX.XXX.XXX/XXXX-XX
    const formatted = digitsOnly.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5',
    );

    return Result.ok<CNPJ>(new CNPJ({ value: formatted }));
  }

  /**
   * Validates CNPJ check digits using the official algorithm
   * https://www.geradorcnpj.com/algoritmo_do_cnpj.htm
   */
  private static validateCheckDigits(cnpj: string): boolean {
    // Extract base number (first 12 digits) and check digits (last 2)
    const base = cnpj.substring(0, 12);
    const providedCheckDigits = cnpj.substring(12, 14);

    // Calculate first check digit
    const firstCheckDigit = this.calculateCheckDigit(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

    // Calculate second check digit (using base + first check digit)
    const baseWithFirstCheck = base + firstCheckDigit;
    const secondCheckDigit = this.calculateCheckDigit(
      baseWithFirstCheck,
      [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
    );

    // Verify both check digits match
    const calculatedCheckDigits = `${firstCheckDigit}${secondCheckDigit}`;
    return calculatedCheckDigits === providedCheckDigits;
  }

  /**
   * Calculates a single check digit using the provided weights
   */
  private static calculateCheckDigit(base: string, weights: number[]): number {
    let sum = 0;

    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i]) * weights[i];
    }

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }

  /**
   * Returns CNPJ with only digits (no formatting)
   * Example: 12345678000190
   */
  public getDigitsOnly(): string {
    return this.value.replace(/\D/g, '');
  }

  /**
   * Returns formatted CNPJ for display
   * Example: 12.345.678/0001-90
   */
  public getFormatted(): string {
    return this.value;
  }
}
