import { IUseCase } from '../../../../shared/core/use-case.interface';
import { Result } from '../../../../shared/core/result';
import { LinkSocialAccountDto } from '../dtos/link-social-account.dto';
import { IUserRepository } from '../../domain/ports/user-repository.interface';
import { ISocialAccountRepository } from '../ports/social-account.repository.interface';
import { IOAuthProvider } from '../ports/oauth-provider.interface';
import { SocialAccount } from '../../domain/entities/social-account';
import { SocialProvider } from '../../domain/value-objects/social-provider';
import { SocialAccountId } from '../../domain/value-objects/social-account-id';
import { Email } from '../../domain/value-objects/email';

export class LinkSocialAccountUseCase
  implements IUseCase<LinkSocialAccountDto, Result<void>>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly socialAccountRepository: ISocialAccountRepository,
    private readonly oauthProvider: IOAuthProvider,
  ) {}

  async execute(request: LinkSocialAccountDto): Promise<Result<void>> {
    try {
      // Find user
      const user = await this.userRepository.findById(request.userId);
      if (!user) {
        return Result.fail<void>('User not found');
      }

      if (!user.isActive) {
        return Result.fail<void>('User account is inactive');
      }

      // Validate provider
      const providerOrError = SocialProvider.create(request.provider);
      if (providerOrError.isFailure) {
        return Result.fail<void>(`Invalid provider: ${providerOrError.error}`);
      }
      const provider = providerOrError.getValue();

      // Check if provider already linked to this user
      const existingAccount =
        await this.socialAccountRepository.findByUserIdAndProvider(
          user.id,
          provider,
        );

      if (existingAccount) {
        return Result.fail<void>(
          `Social account for provider ${provider.value} is already linked to this user`
        );
      }

      // Exchange OAuth code for user profile
      const socialProfile = await this.oauthProvider.exchangeCodeForProfile(
        request.code,
        request.redirectUri,
      );

      // Check if social account is already linked to another user
      const existingSocialAccount =
        await this.socialAccountRepository.findByProviderAndProviderId(
          provider,
          socialProfile.id,
        );

      if (existingSocialAccount) {
        return Result.fail<void>(
          'This social account is already linked to another user'
        );
      }

      // Create social account
      const providerIdOrError = SocialAccountId.create(socialProfile.id);
      if (providerIdOrError.isFailure) {
        return Result.fail<void>(`Invalid provider ID: ${providerIdOrError.error}`);
      }

      const emailOrError = Email.create(socialProfile.email);
      if (emailOrError.isFailure) {
        return Result.fail<void>(`Invalid email: ${emailOrError.error}`);
      }

      const socialAccountOrError = SocialAccount.create({
        userId: user.id,
        provider,
        providerId: providerIdOrError.getValue(),
        email: emailOrError.getValue(),
        displayName: socialProfile.displayName,
        avatarUrl: socialProfile.avatarUrl,
      });

      if (socialAccountOrError.isFailure) {
        return Result.fail<void>(
          `Failed to create social account: ${socialAccountOrError.error}`
        );
      }

      const socialAccount = socialAccountOrError.getValue();

      // Link to user
      const linkResult = user.linkSocialAccount(socialAccount);
      if (linkResult.isFailure) {
        return Result.fail<void>(linkResult.error || 'Failed to link social account');
      }

      // Save
      await this.socialAccountRepository.save(socialAccount);

      return Result.ok<void>();
    } catch (error) {
      return Result.fail<void>(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }
}
