import { IUseCase } from '../../../../shared/core/use-case.interface';
import { Result } from '../../../../shared/core/result';
import { UnlinkSocialAccountDto } from '../dtos/unlink-social-account.dto';
import { IUserRepository } from '../../domain/ports/user-repository.interface';
import { ISocialAccountRepository } from '../ports/social-account.repository.interface';
import { SocialProvider } from '../../domain/value-objects/social-provider';

export class UnlinkSocialAccountUseCase
  implements IUseCase<UnlinkSocialAccountDto, Result<void>>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly socialAccountRepository: ISocialAccountRepository,
  ) {}

  async execute(request: UnlinkSocialAccountDto): Promise<Result<void>> {
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

      // Find social account
      const socialAccount =
        await this.socialAccountRepository.findByUserIdAndProvider(
          user.id,
          provider,
        );

      if (!socialAccount) {
        return Result.fail<void>(
          `Social account for provider ${provider.value} is not linked to this user`
        );
      }

      // Unlink from user
      const unlinkResult = user.unlinkSocialAccount(provider);
      if (unlinkResult.isFailure) {
        return Result.fail<void>(unlinkResult.error || 'Failed to unlink social account');
      }

      // Delete social account
      await this.socialAccountRepository.delete(socialAccount);

      return Result.ok<void>();
    } catch (error) {
      return Result.fail<void>(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }
}
