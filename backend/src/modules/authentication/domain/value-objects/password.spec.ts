import { Password } from './password';

describe('Password Value Object', () => {
  describe('create', () => {
    it('should create a valid password', async () => {
      // Arrange
      const validPassword = 'StrongPass123!';

      // Act
      const result = await Password.create(validPassword);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isHashed).toBe(true);
    });

    it('should fail when password is empty', async () => {
      // Arrange
      const emptyPassword = '';

      // Act
      const result = await Password.create(emptyPassword);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('required');
    });

    it('should fail when password is null or undefined', async () => {
      // Act & Assert
      const resultNull = await Password.create(null as any);
      expect(resultNull.isFailure).toBe(true);

      const resultUndefined = await Password.create(undefined as any);
      expect(resultUndefined.isFailure).toBe(true);
    });

    it('should fail when password is less than 8 characters', async () => {
      // Arrange
      const shortPassword = 'Pass1';

      // Act
      const result = await Password.create(shortPassword);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('8 characters');
    });

    it('should fail when password does not contain uppercase letter', async () => {
      // Arrange
      const noUppercase = 'password123';

      // Act
      const result = await Password.create(noUppercase);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('uppercase');
    });

    it('should fail when password does not contain lowercase letter', async () => {
      // Arrange
      const noLowercase = 'PASSWORD123';

      // Act
      const result = await Password.create(noLowercase);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('lowercase');
    });

    it('should fail when password does not contain a number', async () => {
      // Arrange
      const noNumber = 'PasswordOnly!';

      // Act
      const result = await Password.create(noNumber);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('number');
    });

    it('should fail when password does not contain a special character', async () => {
      // Arrange
      const noSpecialChar = 'Password123';

      // Act
      const result = await Password.create(noSpecialChar);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('special character');
    });

    it('should hash the password when creating', async () => {
      // Arrange
      const plainPassword = 'StrongPass123!';

      // Act
      const result = await Password.create(plainPassword);

      // Assert
      expect(result.isSuccess).toBe(true);
      const password = result.getValue();
      expect(password.value).not.toBe(plainPassword);
      expect(password.value).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash pattern
    });

    it('should create password from already hashed value', async () => {
      // Arrange
      const hashedValue = '$2b$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234';

      // Act
      const result = await Password.create(hashedValue, true);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(hashedValue);
      expect(result.getValue().isHashed).toBe(true);
    });
  });

  describe('comparePassword', () => {
    it('should return true when comparing correct password', async () => {
      // Arrange
      const plainPassword = 'StrongPass123!';
      const password = (await Password.create(plainPassword)).getValue();

      // Act
      const isMatch = await password.comparePassword(plainPassword);

      // Assert
      expect(isMatch).toBe(true);
    });

    it('should return false when comparing incorrect password', async () => {
      // Arrange
      const plainPassword = 'StrongPass123!';
      const wrongPassword = 'WrongPass456!';
      const password = (await Password.create(plainPassword)).getValue();

      // Act
      const isMatch = await password.comparePassword(wrongPassword);

      // Assert
      expect(isMatch).toBe(false);
    });

    it('should handle empty string comparison', async () => {
      // Arrange
      const password = (await Password.create('StrongPass123!')).getValue();

      // Act
      const isMatch = await password.comparePassword('');

      // Assert
      expect(isMatch).toBe(false);
    });
  });

  describe('getHashedValue', () => {
    it('should return hashed value when already hashed', async () => {
      // Arrange
      const plainPassword = 'StrongPass123!';
      const password = (await Password.create(plainPassword)).getValue();

      // Act
      const hashedValue = await password.getHashedValue();

      // Assert
      expect(hashedValue).toBe(password.value);
      expect(hashedValue).toMatch(/^\$2[aby]\$.{56}$/);
    });
  });

  describe('edge cases', () => {
    it('should accept password with special characters', async () => {
      // Arrange
      const passwordWithSpecial = 'Strong@Pass#123!';

      // Act
      const result = await Password.create(passwordWithSpecial);

      // Assert
      expect(result.isSuccess).toBe(true);
    });

    it('should accept minimum valid password', async () => {
      // Arrange
      const minValidPassword = 'Pass123!';

      // Act
      const result = await Password.create(minValidPassword);

      // Assert
      expect(result.isSuccess).toBe(true);
    });

    it('should accept very long password', async () => {
      // Arrange
      const longPassword = 'A'.repeat(50) + 'a1!';

      // Act
      const result = await Password.create(longPassword);

      // Assert
      expect(result.isSuccess).toBe(true);
    });

    it('should trim whitespace from password', async () => {
      // Arrange
      const passwordWithSpaces = '  StrongPass123!  ';

      // Act
      const result = await Password.create(passwordWithSpaces);

      // Assert
      expect(result.isSuccess).toBe(true);
    });
  });
});
