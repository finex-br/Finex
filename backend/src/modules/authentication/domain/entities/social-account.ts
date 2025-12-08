import { Entity } from '../../../../shared/core/entity';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';
import { Result } from '../../../../shared/core/result';
import { SocialProvider } from '../value-objects/social-provider';
import { SocialAccountId } from '../value-objects/social-account-id';
import { Email } from '../value-objects/email';

export interface SocialAccountProps {
  userId: UniqueEntityID;
  provider: SocialProvider;
  providerId: SocialAccountId;
  email: Email;
  displayName: string;
  avatarUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SocialAccount extends Entity<SocialAccountProps> {
  get userId(): UniqueEntityID {
    return this.props.userId;
  }

  get provider(): SocialProvider {
    return this.props.provider;
  }

  get providerId(): SocialAccountId {
    return this.props.providerId;
  }

  get email(): Email {
    return this.props.email;
  }

  get displayName(): string {
    return this.props.displayName;
  }

  get avatarUrl(): string | undefined {
    return this.props.avatarUrl;
  }

  get createdAt(): Date {
    return this.props.createdAt!;
  }

  get updatedAt(): Date {
    return this.props.updatedAt!;
  }

  private constructor(props: SocialAccountProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: SocialAccountProps,
    id?: UniqueEntityID,
  ): Result<SocialAccount> {
    // Validations
    if (!props.userId) {
      return Result.fail<SocialAccount>('User ID is required');
    }

    if (!props.provider) {
      return Result.fail<SocialAccount>('Provider is required');
    }

    if (!props.providerId) {
      return Result.fail<SocialAccount>('Provider ID is required');
    }

    if (!props.email) {
      return Result.fail<SocialAccount>('Email is required');
    }

    if (!props.displayName || props.displayName.trim().length === 0) {
      return Result.fail<SocialAccount>('Display name is required');
    }

    if (props.displayName.trim().length < 2) {
      return Result.fail<SocialAccount>(
        'Display name must have at least 2 characters'
      );
    }

    // Set timestamps if not provided
    const now = new Date();
    const defaultProps: SocialAccountProps = {
      ...props,
      displayName: props.displayName.trim(),
      createdAt: props.createdAt || now,
      updatedAt: props.updatedAt || now,
    };

    return Result.ok<SocialAccount>(new SocialAccount(defaultProps, id));
  }

  public updateAvatarUrl(url: string): void {
    this.props.avatarUrl = url;
    this.props.updatedAt = new Date();
  }

  public updateDisplayName(name: string): Result<void> {
    if (!name || name.trim().length === 0) {
      return Result.fail<void>('Display name is required');
    }

    if (name.trim().length < 2) {
      return Result.fail<void>('Display name must have at least 2 characters');
    }

    this.props.displayName = name.trim();
    this.props.updatedAt = new Date();
    
    return Result.ok<void>();
  }
}
