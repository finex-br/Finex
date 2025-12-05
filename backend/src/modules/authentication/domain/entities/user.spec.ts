import { User } from './user';
import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';
import { PhoneNumber } from '../value-objects/phone-number';
import { UserRole, UserRoleEnum } from '../value-objects/user-role';

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
        isActive: true,
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
      expect(user.isActive).toBe(true);
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
        isActive: true,
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
        isActive: true,
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
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('at least 2 characters');
    });

    it('should default isActive to true when not provided', async () => {
      // Arrange
      const email = Email.create('user@example.com').getValue();
      const password = (await Password.create('StrongPass123!')).getValue();
      const phoneNumber = PhoneNumber.create('11987654321').getValue();

      // Act
      const result = User.create({
        email,
        password,
        name: 'John Doe',
        phoneNumber,
        isActive: undefined as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isActive).toBe(true);
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
        isActive: true,
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

  describe('activate', () => {
    it('should activate an inactive user', async () => {
      // Arrange
      const email = Email.create('user@example.com').getValue();
      const password = (await Password.create('StrongPass123!')).getValue();
      const phoneNumber = PhoneNumber.create('11987654321').getValue();
      const user = User.create({
        email,
        password,
        name: 'John Doe',
        phoneNumber,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getValue();

      const oldUpdatedAt = user.updatedAt;

      // Wait a bit to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10));

      // Act
      user.activate();

      // Assert
      expect(user.isActive).toBe(true);
      expect(user.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
    });
  });

  describe('deactivate', () => {
    it('should deactivate an active user', async () => {
      // Arrange
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

      const oldUpdatedAt = user.updatedAt;

      // Wait a bit to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10));

      // Act
      user.deactivate();

      // Assert
      expect(user.isActive).toBe(false);
      expect(user.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
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
        isActive: true,
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
        isActive: true,
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
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getValue();

      const user2 = User.create({
        email: email2,
        password,
        name: 'Jane Doe',
        phoneNumber: phoneNumber2,
        isActive: true,
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
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getValue();

      // Act & Assert
      expect(user.equals(null as any)).toBe(false);
      expect(user.equals(undefined as any)).toBe(false);
    });

    it('should fail when phoneNumber is null or undefined', async () => {
      // Arrange
      const email = Email.create('user@example.com').getValue();
      const password = (await Password.create('StrongPass123!')).getValue();

      // Act
      const result = User.create({
        email,
        password,
        name: 'John Doe',
        phoneNumber: null as any,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('phoneNumber is required');
    });
  });
});
