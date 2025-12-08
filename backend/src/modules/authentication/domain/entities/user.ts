import { Entity } from '../../../../shared/core/entity';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';
import { Result } from '../../../../shared/core/result';
import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';
import { UserRole, UserRoleEnum } from '../value-objects/user-role';
import { PhoneNumber } from '../value-objects/phone-number';
import { SocialAccount } from './social-account';
import { SocialProvider } from '../value-objects/social-provider';

interface UserProps {
  email: Email;
  password: Password;
  name: string;
  phoneNumber: PhoneNumber;
  role?: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  socialAccounts?: SocialAccount[];
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

  get socialAccounts(): SocialAccount[] {
    return this.props.socialAccounts || [];
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

  public linkSocialAccount(socialAccount: SocialAccount): Result<void> {
    // Check if provider is already linked
    const existingAccount = this.socialAccounts.find(
      (account) => account.provider.equals(socialAccount.provider)
    );

    if (existingAccount) {
      return Result.fail<void>(
        `Social account for provider ${socialAccount.provider.value} is already linked`
      );
    }

    // Initialize array if needed
    if (!this.props.socialAccounts) {
      this.props.socialAccounts = [];
    }

    this.props.socialAccounts.push(socialAccount);
    this.props.updatedAt = new Date();

    return Result.ok<void>();
  }

  public unlinkSocialAccount(provider: SocialProvider): Result<void> {
    const accountIndex = this.socialAccounts.findIndex(
      (account) => account.provider.equals(provider)
    );

    if (accountIndex === -1) {
      return Result.fail<void>(
        `Social account for provider ${provider.value} is not linked`
      );
    }

    this.props.socialAccounts!.splice(accountIndex, 1);
    this.props.updatedAt = new Date();

    return Result.ok<void>();
  }

  public hasSocialAccount(provider: SocialProvider): boolean {
    return this.socialAccounts.some(
      (account) => account.provider.equals(provider)
    );
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
        socialAccounts: props.socialAccounts || [],
      },
      id,
    );

    return Result.ok<User>(user);
  }
}
