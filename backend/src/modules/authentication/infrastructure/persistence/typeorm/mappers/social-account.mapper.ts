import { Result } from '../../../../../../shared/core/result';
import { UniqueEntityID } from '../../../../../../shared/core/unique-entity-id';
import { SocialAccount } from '../../../../domain/entities/social-account';
import { SocialProvider } from '../../../../domain/value-objects/social-provider';
import { SocialAccountId } from '../../../../domain/value-objects/social-account-id';
import { Email } from '../../../../domain/value-objects/email';
import { SocialAccountSchema } from '../schemas/social-account.schema';

export class SocialAccountMapper {
  public static toDomain(raw: SocialAccountSchema): Result<SocialAccount> {
    const providerOrError = SocialProvider.create(raw.provider);
    if (providerOrError.isFailure) {
      return Result.fail<SocialAccount>(
        `Failed to create provider: ${providerOrError.error}`
      );
    }

    const providerIdOrError = SocialAccountId.create(raw.providerId);
    if (providerIdOrError.isFailure) {
      return Result.fail<SocialAccount>(
        `Failed to create provider ID: ${providerIdOrError.error}`
      );
    }

    const emailOrError = Email.create(raw.email);
    if (emailOrError.isFailure) {
      return Result.fail<SocialAccount>(
        `Failed to create email: ${emailOrError.error}`
      );
    }

    const accountOrError = SocialAccount.create(
      {
        userId: new UniqueEntityID(raw.userId),
        provider: providerOrError.getValue(),
        providerId: providerIdOrError.getValue(),
        email: emailOrError.getValue(),
        displayName: raw.displayName,
        avatarUrl: raw.avatarUrl,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    );

    if (accountOrError.isFailure) {
      return Result.fail<SocialAccount>(accountOrError.error || 'Failed to create social account');
    }

    return Result.ok<SocialAccount>(accountOrError.getValue());
  }

  public static toPersistence(account: SocialAccount): SocialAccountSchema {
    const schema = new SocialAccountSchema();
    schema.id = account.id.toString();
    schema.userId = account.userId.toString();
    schema.provider = account.provider.value;
    schema.providerId = account.providerId.value;
    schema.email = account.email.value;
    schema.displayName = account.displayName;
    schema.avatarUrl = account.avatarUrl;
    schema.createdAt = account.createdAt;
    schema.updatedAt = account.updatedAt;
    return schema;
  }
}
