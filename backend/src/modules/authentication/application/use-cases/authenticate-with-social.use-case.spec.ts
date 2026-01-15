import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AuthenticateWithSocialUseCase } from './authenticate-with-social.use-case';
import { IUserRepository } from '../../domain/ports/user-repository.interface';
import { ISocialAccountRepository } from '../ports/social-account.repository.interface';
import { IOAuthProvider } from '../ports/oauth-provider.interface';
import { ITokenService } from '../../domain/ports/token-service.interface';
import { User } from '../../domain/entities/user';
import { SocialAccount } from '../../domain/entities/social-account';
import { Email } from '../../domain/value-objects/email';
import { Password } from '../../domain/value-objects/password';
import { PhoneNumber } from '../../domain/value-objects/phone-number';
import { SocialProvider } from '../../domain/value-objects/social-provider';
import { SocialAccountId } from '../../domain/value-objects/social-account-id';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';

describe('AuthenticateWithSocialUseCase', () => {
  let useCase: AuthenticateWithSocialUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let socialAccountRepository: jest.Mocked<ISocialAccountRepository>;
  let oauthProvider: jest.Mocked<IOAuthProvider>;
  let tokenService: jest.Mocked<ITokenService>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByPhoneNumber: jest.fn(),
      exists: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    socialAccountRepository = {
      findByUserIdAndProvider: jest.fn(),
      findByProviderAndProviderId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as any;

    oauthProvider = {
      exchangeCodeForProfile: jest.fn(),
      getProvider: jest.fn().mockReturnValue('GOOGLE'),
    } as any;

    tokenService = {
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
    } as any;

    useCase = new AuthenticateWithSocialUseCase(
      userRepository,
      socialAccountRepository,
      oauthProvider,
      tokenService,
    );
  });

  describe('when user exists with linked social account', () => {
    it('should authenticate successfully', async () => {
      const socialProfile = {
        id: 'google123',
        email: 'user@gmail.com',
        displayName: 'John Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
        provider: 'GOOGLE',
      };

      const email = Email.create('user@gmail.com').getValue();
      const password = (await Password.create('StrongPass123!')).getValue();
      const phoneNumber = PhoneNumber.create('11987654321').getValue();
      const user = User.create({
        email,
        password,
        name: 'John Doe',
        phoneNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getValue();

      const provider = SocialProvider.create('GOOGLE').getValue();
      const providerId = SocialAccountId.create('google123').getValue();
      const socialAccount = SocialAccount.create({
        userId: user.id,
        provider,
        providerId,
        email,
        displayName: 'John Doe',
      }).getValue();

      oauthProvider.exchangeCodeForProfile.mockResolvedValue(socialProfile);
      socialAccountRepository.findByProviderAndProviderId.mockResolvedValue(socialAccount);
      userRepository.findById.mockResolvedValue(user);
      tokenService.generateToken.mockResolvedValue('access-token');

      const result = await useCase.execute({
        provider: 'GOOGLE',
        code: 'auth-code-123',
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().accessToken).toBe('access-token');
      expect(result.getValue().refreshToken).toBe('access-token');
      expect(oauthProvider.exchangeCodeForProfile).toHaveBeenCalledWith('auth-code-123', undefined);
      expect(socialAccountRepository.findByProviderAndProviderId).toHaveBeenCalled();
    });
  });

  describe('when new user registers via social', () => {
    it('should create user and link social account', async () => {
      const socialProfile = {
        id: 'google456',
        email: 'newuser@gmail.com',
        displayName: 'Jane Doe',
        avatarUrl: 'https://example.com/avatar2.jpg',
        provider: 'GOOGLE',
      };

      oauthProvider.exchangeCodeForProfile.mockResolvedValue(socialProfile);
      socialAccountRepository.findByProviderAndProviderId.mockResolvedValue(null);
      userRepository.findByEmail.mockResolvedValue(null);
      tokenService.generateToken.mockResolvedValue('new-access-token');

      const result = await useCase.execute({
        provider: 'GOOGLE',
        code: 'auth-code-456',
      });

      expect(result.isSuccess).toBe(true);
      expect(userRepository.save).toHaveBeenCalled();
      expect(socialAccountRepository.save).toHaveBeenCalled();
      expect(result.getValue().accessToken).toBe('new-access-token');
    });
  });

  describe('when existing user links new social account', () => {
    it('should link social account to existing user', async () => {
      const socialProfile = {
        id: 'github789',
        email: 'user@gmail.com',
        displayName: 'John Doe',
        provider: 'GITHUB',
      };

      const email = Email.create('user@gmail.com').getValue();
      const password = (await Password.create('StrongPass123!')).getValue();
      const phoneNumber = PhoneNumber.create('11987654321').getValue();
      const existingUser = User.create({
        email,
        password,
        name: 'John Doe',
        phoneNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getValue();

      oauthProvider.exchangeCodeForProfile.mockResolvedValue(socialProfile);
      oauthProvider.getProvider.mockReturnValue('GITHUB');
      socialAccountRepository.findByProviderAndProviderId.mockResolvedValue(null);
      userRepository.findByEmail.mockResolvedValue(existingUser);
      tokenService.generateToken.mockResolvedValue('linked-access-token');

      const result = await useCase.execute({
        provider: 'GITHUB',
        code: 'auth-code-789',
      });

      expect(result.isSuccess).toBe(true);
      expect(socialAccountRepository.save).toHaveBeenCalled();
      expect(result.getValue().accessToken).toBe('linked-access-token');
    });
  });

  describe('error handling', () => {
    it('should fail with invalid provider', async () => {
      const result = await useCase.execute({
        provider: 'INVALID',
        code: 'auth-code',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Invalid provider');
    });

    it('should fail when oauth provider throws error', async () => {
      oauthProvider.exchangeCodeForProfile.mockRejectedValue(
        new Error('OAuth exchange failed')
      );

      const result = await useCase.execute({
        provider: 'GOOGLE',
        code: 'invalid-code',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('OAuth exchange failed');
    });
  });
});
