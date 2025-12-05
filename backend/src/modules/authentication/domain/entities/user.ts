import { Entity } from '../../../../shared/core/entity';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';
import { Result } from '../../../../shared/core/result';
import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';
import { UserRole, UserRoleEnum } from '../value-objects/user-role';
import { PhoneNumber } from '../value-objects/phone-number';

interface UserProps {
  email: Email;
  password: Password;
  name: string;
  phoneNumber: PhoneNumber;
  role?: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Entity - Aggregate Root
 * Represents a user in the authentication system
 */
export class User extends Entity<UserProps> {
  private constructor(props: UserProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get email(): Email {
    return this.props.email;
  }

  get password(): Password {
    return this.props.password;
  }

  get name(): string {
    return this.props.name;
  }

  get phoneNumber(): PhoneNumber {
    return this.props.phoneNumber;
  }

  get role(): UserRole {
    // Role is always defined after creation due to default in create method
    return this.props.role!;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  public deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  public updatePassword(newPassword: Password): void {
    this.props.password = newPassword;
    this.props.updatedAt = new Date();
  }

  public static create(props: UserProps, id?: UniqueEntityID): Result<User> {
    // Validate name
    if (!props.name || props.name.trim().length === 0) {
      return Result.fail<User>('User name is required');
    }

    if (props.name.trim().length < 2) {
      return Result.fail<User>('User name must have at least 2 characters');
    }

    // Validate phoneNumber
    if (!props.phoneNumber) {
      return Result.fail<User>('User phoneNumber is required');
    }

    // Default role to ENTREPRENEUR
    const defaultRole = props.role || UserRole.create(UserRoleEnum.ENTREPRENEUR).getValue();

    // Create user with defaults
    const user = new User(
      {
        ...props,
        role: defaultRole,
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );

    return Result.ok<User>(user);
  }
}
