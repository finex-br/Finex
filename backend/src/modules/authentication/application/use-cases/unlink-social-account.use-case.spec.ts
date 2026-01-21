import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { UnlinkSocialAccountUseCase } from './unlink-social-account.use-case';
import { IUserRepository } from '../../domain/ports/user-repository.interface';
import { ISocialAccountRepository } from '../ports/social-account.repository.interface';
import { User } from '../../domain/entities/user';
import { Email } from '../../domain/value-objects/email';
import { Password } from '../../domain/value-objects/password';
import { PhoneNumber } from '../../domain/value-objects/phone-number';
import { SocialProvider } from '../../domain/value-objects/social-provider';
import { SocialAccountId } from '../../domain/value-objects/social-account-id';
import { SocialAccount } from '../../domain/entities/social-account';

describe('UnlinkSocialAccountUseCase', () => {
  describe('OAuth Disabled', () => {
    it('should fail when trying to unlink social account', () => {
      const result = SocialProvider.create('FACEBOOK');
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('OAuth authentication is currently disabled');
    });
  });

  // NOTE: The following tests are kept for documentation purposes
  // but will be skipped since OAuth is currently disabled
  describe.skip('OAuth enabled tests (SKIPPED)', () => {
  let useCase: UnlinkSocialAccountUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let socialAccountRepository: jest.Mocked<ISocialAccountRepository>;

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

    useCase = new UnlinkSocialAccountUseCase(
      userRepository,
      socialAccountRepository,
    );
  });

  describe('successful unlinking', () => {
    it('should unlink social account from user', async () => {
      const email = Email.create('user@example.com').getValue();
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

      const provider = SocialProvider.create('GITHUB').getValue();
      const providerId = SocialAccountId.create('github123').getValue();
      const socialAccount = SocialAccount.create({
        userId: user.id,
        provider,
        providerId,
        email,
        displayName: 'John Doe',
      }).getValue();

      user.linkSocialAccount(socialAccount);

      userRepository.findById.mockResolvedValue(user);
      socialAccountRepository.findByUserIdAndProvider.mockResolvedValue(socialAccount);

      const result = await useCase.execute({
        userId: user.id.toString(),
        provider: 'GITHUB',
      });

      expect(result.isSuccess).toBe(true);
      expect(socialAccountRepository.delete).toHaveBeenCalledWith(socialAccount);
    });

    it('should unlink different providers', async () => {
      const email = Email.create('user@example.com').getValue();
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

      const githubProvider = SocialProvider.create('GITHUB').getValue();
      const githubProviderId = SocialAccountId.create('github123').getValue();
      const githubAccount = SocialAccount.create({
        userId: user.id,
        provider: githubProvider,
        providerId: githubProviderId,
        email,
        displayName: 'John Doe',
      }).getValue();

      user.linkSocialAccount(githubAccount);

      userRepository.findById.mockResolvedValue(user);
      socialAccountRepository.findByUserIdAndProvider.mockResolvedValue(githubAccount);

      const result = await useCase.execute({
        userId: user.id.toString(),
        provider: 'GITHUB',
      });

      expect(result.isSuccess).toBe(true);
      expect(socialAccountRepository.delete).toHaveBeenCalledWith(githubAccount);
    });
  });

  describe('error handling', () => {
    it('should fail when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute({
        userId: 'non-existent-user',
        provider: 'GITHUB',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('User not found');
    });

    it('should fail when social account not found', async () => {
      const email = Email.create('user@example.com').getValue();
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

      userRepository.findById.mockResolvedValue(user);
      socialAccountRepository.findByUserIdAndProvider.mockResolvedValue(null);

      const result = await useCase.execute({
        userId: user.id.toString(),
        provider: 'GITHUB',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('not linked');
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
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getValue();

      userRepository.findById.mockResolvedValue(user);

      const result = await useCase.execute({
        userId: user.id.toString(),
        provider: 'INVALID',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Invalid provider');
    });
  });
  });
});
