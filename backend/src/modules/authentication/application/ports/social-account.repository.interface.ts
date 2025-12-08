import { SocialAccount } from '../../domain/entities/social-account';
import { SocialProvider } from '../../domain/value-objects/social-provider';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';

export interface ISocialAccountRepository {
  findByUserIdAndProvider(
    userId: UniqueEntityID,
    provider: SocialProvider,
  ): Promise<SocialAccount | null>;

  findByProviderAndProviderId(
    provider: SocialProvider,
    providerId: string,
  ): Promise<SocialAccount | null>;

  save(socialAccount: SocialAccount): Promise<void>;

  delete(socialAccount: SocialAccount): Promise<void>;
}
