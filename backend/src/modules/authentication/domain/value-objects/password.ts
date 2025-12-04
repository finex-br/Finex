import { ValueObject } from '../../../../shared/core/value-object';
import { Result } from '../../../../shared/core/result';
import * as bcrypt from 'bcrypt';

interface PasswordProps {
  value: string;
  hashed?: boolean;
}

/**
 * Password Value Object
 * Handles password hashing and validation
 */
export class Password extends ValueObject<PasswordProps> {
  private static readonly MIN_LENGTH = 8;
  private static readonly SALT_ROUNDS = 10;

  get value(): string {
    return this.props.value;
  }

  get isHashed(): boolean {
    return this.props.hashed ?? false;
  }

  private constructor(props: PasswordProps) {
    super(props);
  }

  private static hasUppercase(password: string): boolean {
    return /[A-Z]/.test(password);
  }

  private static hasLowercase(password: string): boolean {
    return /[a-z]/.test(password);
  }

  private static hasNumber(password: string): boolean {
    return /\d/.test(password);
  }

  private static hasSpecialCharacter(password: string): boolean {
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  }

  private static isValidPassword(password: string): boolean {
    if (password.length < this.MIN_LENGTH) return false;
    if (!this.hasUppercase(password)) return false;
    if (!this.hasLowercase(password)) return false;
    if (!this.hasNumber(password)) return false;
    if (!this.hasSpecialCharacter(password)) return false;
    return true;
  }

  public async comparePassword(plainTextPassword: string): Promise<boolean> {
    if (!plainTextPassword || plainTextPassword.length === 0) {
      return false;
    }

    if (!this.isHashed) {
      return this.props.value === plainTextPassword;
    }

    try {
      return await bcrypt.compare(plainTextPassword, this.props.value);
    } catch (error) {
      return false;
    }
  }

  public async getHashedValue(): Promise<string> {
    if (this.isHashed) {
      return this.props.value;
    }
    return await bcrypt.hash(this.props.value, Password.SALT_ROUNDS);
  }

  public static async create(password: string, hashed: boolean = false): Promise<Result<Password>> {
    // Check for null or undefined
    if (password === null || password === undefined) {
      return Result.fail<Password>('Password is required');
    }

    // Trim whitespace
    const trimmedPassword = password.trim();

    // Check for empty string
    if (trimmedPassword.length === 0) {
      return Result.fail<Password>('Password is required');
    }

    // If already hashed, skip validation
    if (hashed) {
      return Result.ok<Password>(new Password({ value: trimmedPassword, hashed: true }));
    }

    // Validate length
    if (trimmedPassword.length < this.MIN_LENGTH) {
      return Result.fail<Password>(`Password must have at least ${this.MIN_LENGTH} characters`);
    }

    // Validate uppercase
    if (!this.hasUppercase(trimmedPassword)) {
      return Result.fail<Password>('Password must contain at least one uppercase letter');
    }

    // Validate lowercase
    if (!this.hasLowercase(trimmedPassword)) {
      return Result.fail<Password>('Password must contain at least one lowercase letter');
    }

    // Validate number
    if (!this.hasNumber(trimmedPassword)) {
      return Result.fail<Password>('Password must contain at least one number');
    }

    // Validate special character
    if (!this.hasSpecialCharacter(trimmedPassword)) {
      return Result.fail<Password>('Password must contain at least one special character');
    }

    // Hash the password
    try {
      const hashedPassword = await bcrypt.hash(trimmedPassword, this.SALT_ROUNDS);
      return Result.ok<Password>(new Password({ value: hashedPassword, hashed: true }));
    } catch (error) {
      return Result.fail<Password>('Failed to hash password');
    }
  }
}
