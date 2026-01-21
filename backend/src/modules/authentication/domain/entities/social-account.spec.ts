import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SocialAccount } from './social-account';
import { SocialProvider } from '../value-objects/social-provider';
import { SocialAccountId } from '../value-objects/social-account-id';
import { Email } from '../value-objects/email';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';

describe('SocialAccount Entity', () => {
  describe('OAuth Disabled', () => {
    it('should fail to create social account when OAuth is disabled', () => {
      const providerResult = SocialProvider.create('GITHUB');
      
      expect(providerResult.isFailure).toBe(true);
      expect(providerResult.error).toContain('OAuth authentication is currently disabled');
    });

    it('should fail with any provider when OAuth is disabled', () => {
      const providers = ['GOOGLE', 'GITHUB', 'FACEBOOK'];
      
      providers.forEach(providerName => {
        const result = SocialProvider.create(providerName);
        expect(result.isFailure).toBe(true);
        expect(result.error).toContain('OAuth authentication is currently disabled');
      });
    });
  });

  // NOTE: The following tests are kept for documentation purposes
  // but will be skipped since OAuth is currently disabled
  describe.skip('create (OAuth enabled - SKIPPED)', () => {
    it('should create a valid social account', () => {
      const provider = SocialProvider.create('GITHUB').getValue();
      const providerId = SocialAccountId.create('123456789').getValue();
      const email = Email.create('user@github.com').getValue();

      const accountOrError = SocialAccount.create({
        userId: new UniqueEntityID('user-123'),
        provider,
        providerId,
        email,
        displayName: 'John Doe',
      });

      expect(accountOrError.isSuccess).toBe(true);
      const account = accountOrError.getValue();
      expect(account.userId.toString()).toBe('user-123');
      expect(account.provider.value).toBe('GITHUB');
      expect(account.providerId.value).toBe('123456789');
      expect(account.email.value).toBe('user@github.com');
      expect(account.displayName).toBe('John Doe');
      expect(account.avatarUrl).toBeUndefined();
    });

    it('should create with avatar url', () => {
      const provider = SocialProvider.create('GITHUB').getValue();
      const providerId = SocialAccountId.create('github123').getValue();
      const email = Email.create('dev@github.com').getValue();

      const accountOrError = SocialAccount.create({
        userId: new UniqueEntityID('user-456'),
        provider,
        providerId,
        email,
        displayName: 'Dev User',
        avatarUrl: 'https://avatars.github.com/u/123',
      });

      expect(accountOrError.isSuccess).toBe(true);
      expect(accountOrError.getValue().avatarUrl).toBe('https://avatars.github.com/u/123');
    });

    it('should create with timestamps', () => {
      const provider = SocialProvider.create('FACEBOOK').getValue();
      const providerId = SocialAccountId.create('fb123').getValue();
      const email = Email.create('user@facebook.com').getValue();
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const accountOrError = SocialAccount.create({
        userId: new UniqueEntityID('user-789'),
        provider,
        providerId,
        email,
        displayName: 'FB User',
        createdAt,
        updatedAt,
      });

      expect(accountOrError.isSuccess).toBe(true);
      const account = accountOrError.getValue();
      expect(account.createdAt).toEqual(createdAt);
      expect(account.updatedAt).toEqual(updatedAt);
    });

    it('should fail without userId', () => {
      const provider = SocialProvider.create('GITHUB').getValue();
      const providerId = SocialAccountId.create('123').getValue();
      const email = Email.create('user@github.com').getValue();

      const accountOrError = SocialAccount.create({
        userId: null as any,
        provider,
        providerId,
        email,
        displayName: 'John Doe',
      });

      expect(accountOrError.isFailure).toBe(true);
      expect(accountOrError.error).toContain('User ID is required');
    });

    it('should fail without provider', () => {
      const providerId = SocialAccountId.create('123').getValue();
      const email = Email.create('user@github.com').getValue();

      const accountOrError = SocialAccount.create({
        userId: new UniqueEntityID('user-123'),
        provider: null as any,
        providerId,
        email,
        displayName: 'John Doe',
      });

      expect(accountOrError.isFailure).toBe(true);
      expect(accountOrError.error).toContain('Provider is required');
    });

    it('should fail without providerId', () => {
      const provider = SocialProvider.create('GITHUB').getValue();
      const email = Email.create('user@github.com').getValue();

      const accountOrError = SocialAccount.create({
        userId: new UniqueEntityID('user-123'),
        provider,
        providerId: null as any,
        email,
        displayName: 'John Doe',
      });

      expect(accountOrError.isFailure).toBe(true);
      expect(accountOrError.error).toContain('Provider ID is required');
    });

    it('should fail without email', () => {
      const provider = SocialProvider.create('GITHUB').getValue();
      const providerId = SocialAccountId.create('123').getValue();

      const accountOrError = SocialAccount.create({
        userId: new UniqueEntityID('user-123'),
        provider,
        providerId,
        email: null as any,
        displayName: 'John Doe',
      });

      expect(accountOrError.isFailure).toBe(true);
      expect(accountOrError.error).toContain('Email is required');
    });

    it('should fail without displayName', () => {
      const provider = SocialProvider.create('GITHUB').getValue();
      const providerId = SocialAccountId.create('123').getValue();
      const email = Email.create('user@github.com').getValue();

      const accountOrError = SocialAccount.create({
        userId: new UniqueEntityID('user-123'),
        provider,
        providerId,
        email,
        displayName: '',
      });

      expect(accountOrError.isFailure).toBe(true);
      expect(accountOrError.error).toContain('Display name is required');
    });

    it('should fail with displayName less than 2 characters', () => {
      const provider = SocialProvider.create('GITHUB').getValue();
      const providerId = SocialAccountId.create('123').getValue();
      const email = Email.create('user@github.com').getValue();

      const accountOrError = SocialAccount.create({
        userId: new UniqueEntityID('user-123'),
        provider,
        providerId,
        email,
        displayName: 'A',
      });

      expect(accountOrError.isFailure).toBe(true);
      expect(accountOrError.error).toContain('Display name must have at least 2 characters');
    });
  });

  // NOTE: OAuth disabled - these method tests are kept for documentation
  describe.skip('methods (OAuth disabled)', () => {
    it('should update avatar url', () => {
      const provider = SocialProvider.create('GITHUB').getValue();
      const providerId = SocialAccountId.create('123').getValue();
      const email = Email.create('user@github.com').getValue();

      const account = SocialAccount.create({
        userId: new UniqueEntityID('user-123'),
        provider,
        providerId,
        email,
        displayName: 'John Doe',
      }).getValue();

      account.updateAvatarUrl('https://example.com/avatar.jpg');

      expect(account.avatarUrl).toBe('https://example.com/avatar.jpg');
    });

    it('should update display name', () => {
      const provider = SocialProvider.create('GITHUB').getValue();
      const providerId = SocialAccountId.create('123').getValue();
      const email = Email.create('user@github.com').getValue();

      const account = SocialAccount.create({
        userId: new UniqueEntityID('user-123'),
        provider,
        providerId,
        email,
        displayName: 'John Doe',
      }).getValue();

      const result = account.updateDisplayName('Jane Doe');

      expect(result.isSuccess).toBe(true);
      expect(account.displayName).toBe('Jane Doe');
    });

    it('should fail to update display name with invalid value', () => {
      const provider = SocialProvider.create('GITHUB').getValue();
      const providerId = SocialAccountId.create('123').getValue();
      const email = Email.create('user@github.com').getValue();

      const account = SocialAccount.create({
        userId: new UniqueEntityID('user-123'),
        provider,
        providerId,
        email,
        displayName: 'John Doe',
      }).getValue();

      const result = account.updateDisplayName('A');

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Display name must have at least 2 characters');
      expect(account.displayName).toBe('John Doe'); // Should not change
    });
  });
});
