import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { LinkSocialAccountUseCase } from './link-social-account.use-case';
import { IUserRepository } from '../../domain/ports/user-repository.interface';
import { ISocialAccountRepository } from '../ports/social-account.repository.interface';
import { IOAuthProvider } from '../ports/oauth-provider.interface';
import { User } from '../../domain/entities/user';
import { Email } from '../../domain/value-objects/email';
import { Password } from '../../domain/value-objects/password';
import { PhoneNumber } from '../../domain/value-objects/phone-number';
import { SocialProvider } from '../../domain/value-objects/social-provider';
import { SocialAccountId } from '../../domain/value-objects/social-account-id';
import { SocialAccount } from '../../domain/entities/social-account';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';

describe('LinkSocialAccountUseCase', () => {
  let useCase: LinkSocialAccountUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let socialAccountRepository: jest.Mocked<ISocialAccountRepository>;
  let oauthProvider: jest.Mocked<IOAuthProvider>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
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

    useCase = new LinkSocialAccountUseCase(
      userRepository,
      socialAccountRepository,
      oauthProvider,
    );
  });

  describe('successful linking', () => {
    it('should link social account to existing user', async () => {
      const email = Email.create('user@example.com').getValue();
      const password = (await Password.create('StrongPass123!')).getValue();
      const phoneNumber = PhoneNumber.create('11987654321').getValue();
      const user = User.create({
        email,
        password,
        name: 'John Doe',
        phoneNumber,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getValue();

      const socialProfile = {
        id: 'google123',
        email: 'user@gmail.com',
        displayName: 'John Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
        provider: 'GOOGLE',
      };

      userRepository.findById.mockResolvedValue(user);
      oauthProvider.exchangeCodeForProfile.mockResolvedValue(socialProfile);
      socialAccountRepository.findByUserIdAndProvider.mockResolvedValue(null);
      socialAccountRepository.findByProviderAndProviderId.mockResolvedValue(null);

      const result = await useCase.execute({
        userId: user.id.toString(),
        provider: 'GOOGLE',
        code: 'auth-code-123',
      });

      expect(result.isSuccess).toBe(true);
      expect(socialAccountRepository.save).toHaveBeenCalled();
    });

    it('should link with redirect URI', async () => {
      const email = Email.create('user@example.com').getValue();
      const password = (await Password.create('StrongPass123!')).getValue();
      const phoneNumber = PhoneNumber.create('11987654321').getValue();
      const user = User.create({
        email,
        password,
        name: 'John Doe',
        phoneNumber,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getValue();

      const socialProfile = {
        id: 'github456',
        email: 'user@github.com',
        displayName: 'John Doe',
        provider: 'GITHUB',
      };

      userRepository.findById.mockResolvedValue(user);
      oauthProvider.exchangeCodeForProfile.mockResolvedValue(socialProfile);
      oauthProvider.getProvider.mockReturnValue('GITHUB');
      socialAccountRepository.findByUserIdAndProvider.mockResolvedValue(null);
      socialAccountRepository.findByProviderAndProviderId.mockResolvedValue(null);

      const result = await useCase.execute({
        userId: user.id.toString(),
        provider: 'GITHUB',
        code: 'auth-code-456',
        redirectUri: 'https://example.com/callback',
      });

      expect(result.isSuccess).toBe(true);
      expect(oauthProvider.exchangeCodeForProfile).toHaveBeenCalledWith(
        'auth-code-456',
        'https://example.com/callback'
      );
    });
  });

  describe('error handling', () => {
    it('should fail when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute({
        userId: 'non-existent-user',
        provider: 'GOOGLE',
        code: 'auth-code',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('User not found');
    });

    it('should fail when user is inactive', async () => {
      const email = Email.create('user@example.com').getValue();
      const password = (await Password.create('StrongPass123!')).getValue();
      const phoneNumber = PhoneNumber.create('11987654321').getValue();
      const inactiveUser = User.create({
        email,
        password,
        name: 'John Doe',
        phoneNumber,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getValue();

      userRepository.findById.mockResolvedValue(inactiveUser);

      const result = await useCase.execute({
        userId: inactiveUser.id.toString(),
        provider: 'GOOGLE',
        code: 'auth-code',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('inactive');
    });

    it('should fail when provider already linked', async () => {
      const email = Email.create('user@example.com').getValue();
      const password = (await Password.create('StrongPass123!')).getValue();
      const phoneNumber = PhoneNumber.create('11987654321').getValue();
      const user = User.create({
        email,
        password,
        name: 'John Doe',
        phoneNumber,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getValue();

      const provider = SocialProvider.create('GOOGLE').getValue();
      const providerId = SocialAccountId.create('google123').getValue();
      const existingAccount = SocialAccount.create({
        userId: user.id,
        provider,
        providerId,
        email,
        displayName: 'John Doe',
      }).getValue();

      userRepository.findById.mockResolvedValue(user);
      socialAccountRepository.findByUserIdAndProvider.mockResolvedValue(existingAccount);

      const result = await useCase.execute({
        userId: user.id.toString(),
        provider: 'GOOGLE',
        code: 'auth-code',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('already linked');
    });

    it('should fail when social account is linked to different user', async () => {
      const email = Email.create('user@example.com').getValue();
      const password = (await Password.create('StrongPass123!')).getValue();
      const phoneNumber = PhoneNumber.create('11987654321').getValue();
      const user = User.create({
        email,
        password,
        name: 'John Doe',
        phoneNumber,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getValue();

      const provider = SocialProvider.create('GOOGLE').getValue();
      const providerId = SocialAccountId.create('google123').getValue();
      const otherUserAccount = SocialAccount.create({
        userId: new UniqueEntityID('other-user'),
        provider,
        providerId,
        email,
        displayName: 'Other User',
      }).getValue();

      const socialProfile = {
        id: 'google123',
        email: 'user@gmail.com',
        displayName: 'John Doe',
        provider: 'GOOGLE',
      };

      userRepository.findById.mockResolvedValue(user);
      oauthProvider.exchangeCodeForProfile.mockResolvedValue(socialProfile);
      socialAccountRepository.findByUserIdAndProvider.mockResolvedValue(null);
      socialAccountRepository.findByProviderAndProviderId.mockResolvedValue(otherUserAccount);

      const result = await useCase.execute({
        userId: user.id.toString(),
        provider: 'GOOGLE',
        code: 'auth-code',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('already linked to another user');
    });

    it('should fail with invalid provider', async () => {
      const email = Email.create('user@example.com').getValue();
      const password = (await Password.create('StrongPass123!')).getValue();
      const phoneNumber = PhoneNumber.create('11987654321').getValue();
      const user = User.create({
        email,
        password,
        name: 'John Doe',
        phoneNumber,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getValue();

      userRepository.findById.mockResolvedValue(user);

      const result = await useCase.execute({
        userId: user.id.toString(),
        provider: 'INVALID',
        code: 'auth-code',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Invalid provider');
    });
  });
});
