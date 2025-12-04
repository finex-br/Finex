import { ValueObject } from '../../../../shared/core/value-object';
import { Result } from '../../../../shared/core/result';

export enum UserRoleEnum {
  ADMIN = 'ADMIN',
  ENTREPRENEUR = 'ENTREPRENEUR',
  INVESTOR = 'INVESTOR',
}

interface UserRoleProps {
  value: UserRoleEnum;
}

/**
 * UserRole Value Object
 * Represents user permission level
 */
export class UserRole extends ValueObject<UserRoleProps> {
  get value(): UserRoleEnum {
    return this.props.value;
  }

  private constructor(props: UserRoleProps) {
    super(props);
  }

  public static create(role: string): Result<UserRole> {
    // Check for null or undefined
    if (role === null || role === undefined) {
      return Result.fail<UserRole>('User role is required');
    }

    // Normalize: trim and uppercase
    const normalizedRole = role.trim().toUpperCase();

    // Check for empty string
    if (normalizedRole.length === 0) {
      return Result.fail<UserRole>('User role is required');
    }

    // Check if role is valid
    if (!Object.values(UserRoleEnum).includes(normalizedRole as UserRoleEnum)) {
      return Result.fail<UserRole>(`Invalid user role: ${role}`);
    }

    return Result.ok<UserRole>(new UserRole({ value: normalizedRole as UserRoleEnum }));
  }

  public isAdmin(): boolean {
    return this.props.value === UserRoleEnum.ADMIN;
  }

  public isEntrepreneur(): boolean {
    return this.props.value === UserRoleEnum.ENTREPRENEUR;
  }

  public isInvestor(): boolean {
    return this.props.value === UserRoleEnum.INVESTOR;
  }
}
