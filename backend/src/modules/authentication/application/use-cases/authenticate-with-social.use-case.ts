import { IUseCase } from '../../../../shared/core/use-case.interface';
import { Result } from '../../../../shared/core/result';
import { AuthenticateWithSocialDto } from '../dtos/authenticate-with-social.dto';
import { IUserRepository } from '../../domain/ports/user-repository.interface';
import { ISocialAccountRepository } from '../ports/social-account.repository.interface';
import { IOAuthProvider } from '../ports/oauth-provider.interface';
import { ITokenService } from '../../domain/ports/token-service.interface';
import { User } from '../../domain/entities/user';
import { SocialAccount } from '../../domain/entities/social-account';
import { SocialProvider } from '../../domain/value-objects/social-provider';
import { SocialAccountId } from '../../domain/value-objects/social-account-id';
import { Email } from '../../domain/value-objects/email';
import { Password } from '../../domain/value-objects/password';
import { PhoneNumber } from '../../domain/value-objects/phone-number';
import { randomBytes } from 'crypto';

interface AuthenticateWithSocialResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export class AuthenticateWithSocialUseCase
  implements IUseCase<AuthenticateWithSocialDto, Result<AuthenticateWithSocialResponse>>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly socialAccountRepository: ISocialAccountRepository,
    private readonly oauthProvider: IOAuthProvider,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(
    request: AuthenticateWithSocialDto,
  ): Promise<Result<AuthenticateWithSocialResponse>> {
    try {
      // Validate provider
      const providerOrError = SocialProvider.create(request.provider);
      if (providerOrError.isFailure) {
        return Result.fail<AuthenticateWithSocialResponse>(
          `Invalid provider: ${providerOrError.error}`
        );
      }
      const provider = providerOrError.getValue();

      // Exchange OAuth code for user profile
      const socialProfile = await this.oauthProvider.exchangeCodeForProfile(
        request.code,
        request.redirectUri,
      );

      // Check if social account already exists
      const existingSocialAccount =
        await this.socialAccountRepository.findByProviderAndProviderId(
          provider,
          socialProfile.id,
        );

      if (existingSocialAccount) {
        // User already registered with this social account
        const user = await this.userRepository.findById(
          existingSocialAccount.userId.toString(),
        );

        if (!user) {
          return Result.fail<AuthenticateWithSocialResponse>(
            'User not found for social account'
          );
        }

        if (!user.isActive) {
          return Result.fail<AuthenticateWithSocialResponse>(
            'User account is inactive'
          );
        }

        // Generate tokens
        const accessToken = await this.tokenService.generateToken({
          userId: user.id.toString(),
          email: user.email.value,
          role: user.role.value,
        });

        const refreshToken = await this.tokenService.generateToken({
          userId: user.id.toString(),
          email: user.email.value,
          role: user.role.value,
        });

        return Result.ok<AuthenticateWithSocialResponse>({
          accessToken,
          refreshToken,
          userId: user.id.toString(),
        });
      }

      // Check if user exists by email
      const emailOrError = Email.create(socialProfile.email);
      if (emailOrError.isFailure) {
        return Result.fail<AuthenticateWithSocialResponse>(
          `Invalid email: ${emailOrError.error}`
        );
      }
      const email = emailOrError.getValue();

      let user = await this.userRepository.findByEmail(email.value);

      if (!user) {
        // Create new user (registration via social)
        // Generate a strong random password
        const randomPassword = `Aa1!${randomBytes(16).toString('hex')}`;
        const passwordOrError = await Password.create(randomPassword);
        if (passwordOrError.isFailure) {
          return Result.fail<AuthenticateWithSocialResponse>(
            `Failed to generate password: ${passwordOrError.error}`
          );
        }

        // Use a placeholder phone number (will be updated by user later)
        const phoneNumberOrError = PhoneNumber.create('11999999999');
        if (phoneNumberOrError.isFailure) {
          return Result.fail<AuthenticateWithSocialResponse>(
            `Failed to create phone number: ${phoneNumberOrError.error}`
          );
        }

        const userOrError = User.create({
          email,
          password: passwordOrError.getValue(),
          name: socialProfile.displayName,
          phoneNumber: phoneNumberOrError.getValue(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        if (userOrError.isFailure) {
          return Result.fail<AuthenticateWithSocialResponse>(
            `Failed to create user: ${userOrError.error}`
          );
        }

        user = userOrError.getValue();
        await this.userRepository.save(user);
      }

      // Create and link social account
      const providerIdOrError = SocialAccountId.create(socialProfile.id);
      if (providerIdOrError.isFailure) {
        return Result.fail<AuthenticateWithSocialResponse>(
          `Invalid provider ID: ${providerIdOrError.error}`
        );
      }

      const socialAccountOrError = SocialAccount.create({
        userId: user.id,
        provider,
        providerId: providerIdOrError.getValue(),
        email,
        displayName: socialProfile.displayName,
        avatarUrl: socialProfile.avatarUrl,
      });

      if (socialAccountOrError.isFailure) {
        return Result.fail<AuthenticateWithSocialResponse>(
          `Failed to create social account: ${socialAccountOrError.error}`
        );
      }

      const socialAccount = socialAccountOrError.getValue();
      
      // Link to user
      const linkResult = user.linkSocialAccount(socialAccount);
      if (linkResult.isFailure) {
        return Result.fail<AuthenticateWithSocialResponse>(linkResult.error || 'Failed to link social account');
      }

      await this.socialAccountRepository.save(socialAccount);

      // Generate tokens
      const accessToken = await this.tokenService.generateToken({
        userId: user.id.toString(),
        email: user.email.value,
        role: user.role.value,
      });

      const refreshToken = await this.tokenService.generateToken({
        userId: user.id.toString(),
        email: user.email.value,
        role: user.role.value,
      });

      return Result.ok<AuthenticateWithSocialResponse>({
        accessToken,
        refreshToken,
        userId: user.id.toString(),
      });
    } catch (error) {
      return Result.fail<AuthenticateWithSocialResponse>(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }
}
