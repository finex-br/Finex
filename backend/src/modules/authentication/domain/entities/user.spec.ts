import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { User } from './user';
import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';
import { PhoneNumber } from '../value-objects/phone-number';
import { UserRole, UserRoleEnum } from '../value-objects/user-role';
import { SocialAccount } from './social-account';
import { SocialProvider } from '../value-objects/social-provider';
import { SocialAccountId } from '../value-objects/social-account-id';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';

describe('User Entity', () => {
  describe('create', () => {
    it('should create a valid user', async () => {
      // Arrange
      const email = Email.create('user@example.com').getValue();
      const password = await Password.create('StrongPass123!');
      const phoneNumber = PhoneNumber.create('11987654321').getValue();

      // Act
      const result = User.create({
        email,
        password: password.getValue(),
        name: 'John Doe',
        phoneNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Assert
      expect(result.isSuccess).toBe(true);
      const user = result.getValue();
      expect(user.email).toBe(email);
      expect(user.name).toBe('John Doe');
      expect(user.phoneNumber).toBe(phoneNumber);
      expect(user.role.value).toBe(UserRoleEnum.ENTREPRENEUR);
    });

    it('should fail when name is empty', async () => {
      // Arrange
      const email = Email.create('user@example.com').getValue();
      const password = (await Password.create('StrongPass123!')).getValue();
      const phoneNumber = PhoneNumber.create('11987654321').getValue();

      // Act
      const result = User.create({
        email,
        password,
        name: '',
        phoneNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('name is required');
    });

    it('should fail when name is only whitespace', async () => {
      // Arrange
      const email = Email.create('user@example.com').getValue();
      const password = (await Password.create('StrongPass123!')).getValue();
      const phoneNumber = PhoneNumber.create('11987654321').getValue();

      // Act
      const result = User.create({
        email,
        password,
        name: '   ',
        phoneNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('name is required');
    });

    it('should fail when name is too short', async () => {
      // Arrange
      const email = Email.create('user@example.com').getValue();
      const password = (await Password.create('StrongPass123!')).getValue();
      const phoneNumber = PhoneNumber.create('11987654321').getValue();

      // Act
      const result = User.create({
        email,
        password,
        name: 'J',
        phoneNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('at least 2 characters');
    });

    it('should set timestamps when not provided', async () => {
      // Arrange
      const email = Email.create('user@example.com').getValue();
      const password = (await Password.create('StrongPass123!')).getValue();
      const phoneNumber = PhoneNumber.create('11987654321').getValue();
      const beforeCreate = new Date();

      // Act
      const result = User.create({
        email,
        password,
        name: 'John Doe',
        phoneNumber,
        createdAt: undefined as any,
        updatedAt: undefined as any,
      });

      // Assert
      const afterCreate = new Date();
      expect(result.isSuccess).toBe(true);
      const user = result.getValue();
      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(user.updatedAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      // Arrange
      const email = Email.create('user@example.com').getValue();
      const oldPassword = (await Password.create('OldPass123!')).getValue();
      const phoneNumber = PhoneNumber.create('11987654321').getValue();
      const user = User.create({
        email,
        password: oldPassword,
        name: 'John Doe',
        phoneNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getValue();

      const oldUpdatedAt = user.updatedAt;
      const newPassword = (await Password.create('NewPass456!')).getValue();

      // Wait a bit to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10));

      // Act
      user.updatePassword(newPassword);

      // Assert
      expect(user.password).toBe(newPassword);
      expect(user.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
    });
  });

  describe('equals', () => {
    it('should return true for users with same id', async () => {
      // Arrange
      const email = Email.create('user@example.com').getValue();
      const password = (await Password.create('StrongPass123!')).getValue();
      const phoneNumber = PhoneNumber.create('11987654321').getValue();
      
      const user1 = User.create({
        email,
        password,
        name: 'John Doe',
        phoneNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getValue();

      // Act & Assert
      expect(user1.equals(user1)).toBe(true);
    });

    it('should return false for users with different ids', async () => {
      // Arrange
      const email1 = Email.create('user1@example.com').getValue();
      const email2 = Email.create('user2@example.com').getValue();
      const password = (await Password.create('StrongPass123!')).getValue();
      const phoneNumber1 = PhoneNumber.create('11987654321').getValue();
      const phoneNumber2 = PhoneNumber.create('11987654322').getValue();
      
      const user1 = User.create({
        email: email1,
        password,
        name: 'John Doe',
        phoneNumber: phoneNumber1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getValue();

      const user2 = User.create({
        email: email2,
        password,
        name: 'Jane Doe',
        phoneNumber: phoneNumber2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getValue();

      // Act & Assert
      expect(user1.equals(user2)).toBe(false);
    });

    it('should return false when comparing with null or undefined', async () => {
      // Arrange
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

      // Act & Assert
      expect(user.equals(null as any)).toBe(false);
      expect(user.equals(undefined as any)).toBe(false);
    });

    it('should accept when phoneNumber is null or undefined', async () => {
      // Arrange
      const email = Email.create('user@example.com').getValue();
      const password = (await Password.create('StrongPass123!')).getValue();

      // Act
      const result = User.create({
        email,
        password,
        name: 'John Doe',
        phoneNumber: null as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Assert
      expect(result.isSuccess).toBe(true);
      const user = result.getValue();
      expect(user.phoneNumber).toBeFalsy(); // null or undefined
    });
  });

  // NOTE: OAuth disabled - these tests are kept for documentation
  describe.skip('linkSocialAccount (OAuth disabled)', () => {
    it('should link a social account successfully', async () => {
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
      const socialEmail = Email.create('user@github.com').getValue();
      const socialAccount = SocialAccount.create({
        userId: user.id,
        provider,
        providerId,
        email: socialEmail,
        displayName: 'John Doe',
      }).getValue();

      const result = user.linkSocialAccount(socialAccount);

      expect(result.isSuccess).toBe(true);
      expect(user.socialAccounts).toHaveLength(1);
      expect(user.socialAccounts[0]).toBe(socialAccount);
    });

    it('should fail to link duplicate provider', async () => {
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
      const socialEmail = Email.create('user@github.com').getValue();
      
      const socialAccount1 = SocialAccount.create({
        userId: user.id,
        provider,
        providerId,
        email: socialEmail,
        displayName: 'John Doe',
      }).getValue();

      const socialAccount2 = SocialAccount.create({
        userId: user.id,
        provider,
        providerId: SocialAccountId.create('github456').getValue(),
        email: socialEmail,
        displayName: 'John Doe',
      }).getValue();

      user.linkSocialAccount(socialAccount1);
      const result = user.linkSocialAccount(socialAccount2);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('already linked');
      expect(user.socialAccounts).toHaveLength(1);
    });

    it('should link multiple different providers', async () => {
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
      const facebookProvider = SocialProvider.create('FACEBOOK').getValue();
      const socialEmail = Email.create('user@example.com').getValue();

      const githubAccount = SocialAccount.create({
        userId: user.id,
        provider: githubProvider,
        providerId: SocialAccountId.create('github123').getValue(),
        email: socialEmail,
        displayName: 'John Doe',
      }).getValue();

      const facebookAccount = SocialAccount.create({
        userId: user.id,
        provider: facebookProvider,
        providerId: SocialAccountId.create('facebook123').getValue(),
        email: socialEmail,
        displayName: 'John Doe',
      }).getValue();

      user.linkSocialAccount(githubAccount);
      user.linkSocialAccount(facebookAccount);

      expect(user.socialAccounts).toHaveLength(2);
    });
  });
  
  // NOTE: OAuth disabled - these tests are kept for documentation
  describe.skip('unlinkSocialAccount (OAuth disabled)', () => {
    it('should unlink a social account successfully', async () => {
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
      const socialEmail = Email.create('user@github.com').getValue();
      const socialAccount = SocialAccount.create({
        userId: user.id,
        provider,
        providerId,
        email: socialEmail,
        displayName: 'John Doe',
      }).getValue();

      user.linkSocialAccount(socialAccount);
      const result = user.unlinkSocialAccount(provider);

      expect(result.isSuccess).toBe(true);
      expect(user.socialAccounts).toHaveLength(0);
    });

    it('should fail to unlink non-existent provider', async () => {
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
      const result = user.unlinkSocialAccount(provider);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('not linked');
    });
  });

  // NOTE: OAuth disabled - these tests are kept for documentation
  describe.skip('hasSocialAccount (OAuth disabled)', () => {
    it('should return true when provider is linked', async () => {
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
      const socialEmail = Email.create('user@github.com').getValue();
      const socialAccount = SocialAccount.create({
        userId: user.id,
        provider,
        providerId,
        email: socialEmail,
        displayName: 'John Doe',
      }).getValue();

      user.linkSocialAccount(socialAccount);

      expect(user.hasSocialAccount(provider)).toBe(true);
    });

    it('should return false when provider is not linked', async () => {
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

      expect(user.hasSocialAccount(provider)).toBe(false);
    });
  });
});
