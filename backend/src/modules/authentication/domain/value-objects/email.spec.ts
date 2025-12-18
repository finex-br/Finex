import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Email } from './email';

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create a valid email', () => {
      // Arrange
      const validEmail = 'user@example.com';

      // Act
      const result = Email.create(validEmail);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('user@example.com');
    });

    it('should fail when email is empty', () => {
      // Arrange
      const emptyEmail = '';

      // Act
      const result = Email.create(emptyEmail);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeDefined();
    });

    it('should fail when email is null or undefined', () => {
      // Act & Assert
      const resultNull = Email.create(null as any);
      expect(resultNull.isFailure).toBe(true);

      const resultUndefined = Email.create(undefined as any);
      expect(resultUndefined.isFailure).toBe(true);
    });

    it('should fail when email format is invalid', () => {
      // Arrange
      const invalidEmails = [
        'invalid-email',
        'missing@domain',
        '@nodomain.com',
        'no-at-sign.com',
        'spaces in@email.com',
        'double@@domain.com',
      ];

      // Act & Assert
      invalidEmails.forEach((invalidEmail) => {
        const result = Email.create(invalidEmail);
        expect(result.isFailure).toBe(true);
        expect(result.error).toContain('invalid');
      });
    });

    it('should normalize email to lowercase', () => {
      // Arrange
      const mixedCaseEmail = 'USER@EXAMPLE.COM';

      // Act
      const result = Email.create(mixedCaseEmail);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('user@example.com');
    });

    it('should trim whitespace from email', () => {
      // Arrange
      const emailWithSpaces = '  user@example.com  ';

      // Act
      const result = Email.create(emailWithSpaces);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('user@example.com');
    });
  });

  describe('equals', () => {
    it('should return true for emails with same value', () => {
      // Arrange
      const email1 = Email.create('user@example.com').getValue();
      const email2 = Email.create('user@example.com').getValue();

      // Act & Assert
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for emails with different values', () => {
      // Arrange
      const email1 = Email.create('user1@example.com').getValue();
      const email2 = Email.create('user2@example.com').getValue();

      // Act & Assert
      expect(email1.equals(email2)).toBe(false);
    });

    it('should return false when comparing with null or undefined', () => {
      // Arrange
      const email = Email.create('user@example.com').getValue();

      // Act & Assert
      expect(email.equals(null as any)).toBe(false);
      expect(email.equals(undefined as any)).toBe(false);
    });
  });
});
