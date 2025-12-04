import { UserRole, UserRoleEnum } from './user-role';

describe('UserRole Value Object', () => {
  describe('create', () => {
    it('should create a valid ADMIN role', () => {
      // Arrange & Act
      const result = UserRole.create('ADMIN');

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(UserRoleEnum.ADMIN);
    });

    it('should create a valid ENTREPRENEUR role', () => {
      // Arrange & Act
      const result = UserRole.create('ENTREPRENEUR');

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(UserRoleEnum.ENTREPRENEUR);
    });

    it('should create a valid INVESTOR role', () => {
      // Arrange & Act
      const result = UserRole.create('INVESTOR');

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(UserRoleEnum.INVESTOR);
    });

    it('should accept lowercase role names', () => {
      // Arrange & Act
      const adminResult = UserRole.create('admin');
      const entrepreneurResult = UserRole.create('entrepreneur');
      const investorResult = UserRole.create('investor');

      // Assert
      expect(adminResult.isSuccess).toBe(true);
      expect(adminResult.getValue().value).toBe(UserRoleEnum.ADMIN);
      expect(entrepreneurResult.isSuccess).toBe(true);
      expect(entrepreneurResult.getValue().value).toBe(UserRoleEnum.ENTREPRENEUR);
      expect(investorResult.isSuccess).toBe(true);
      expect(investorResult.getValue().value).toBe(UserRoleEnum.INVESTOR);
    });

    it('should accept mixed case role names', () => {
      // Arrange & Act
      const result = UserRole.create('AdMiN');

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(UserRoleEnum.ADMIN);
    });

    it('should trim whitespace from role name', () => {
      // Arrange & Act
      const result = UserRole.create('  ADMIN  ');

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(UserRoleEnum.ADMIN);
    });

    it('should fail when role is empty', () => {
      // Arrange & Act
      const result = UserRole.create('');

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('required');
    });

    it('should fail when role is null or undefined', () => {
      // Act & Assert
      const resultNull = UserRole.create(null as any);
      expect(resultNull.isFailure).toBe(true);

      const resultUndefined = UserRole.create(undefined as any);
      expect(resultUndefined.isFailure).toBe(true);
    });

    it('should fail when role is invalid', () => {
      // Arrange
      const invalidRoles = ['USER', 'MANAGER', 'GUEST', 'invalid', '123'];

      // Act & Assert
      invalidRoles.forEach((invalidRole) => {
        const result = UserRole.create(invalidRole);
        expect(result.isFailure).toBe(true);
        expect(result.error).toContain('Invalid user role');
      });
    });
  });

  describe('role checking methods', () => {
    it('should correctly identify admin role', () => {
      // Arrange
      const adminRole = UserRole.create('ADMIN').getValue();
      const entrepreneurRole = UserRole.create('ENTREPRENEUR').getValue();

      // Act & Assert
      expect(adminRole.isAdmin()).toBe(true);
      expect(entrepreneurRole.isAdmin()).toBe(false);
    });

    it('should correctly identify entrepreneur role', () => {
      // Arrange
      const adminRole = UserRole.create('ADMIN').getValue();
      const entrepreneurRole = UserRole.create('ENTREPRENEUR').getValue();

      // Act & Assert
      expect(entrepreneurRole.isEntrepreneur()).toBe(true);
      expect(adminRole.isEntrepreneur()).toBe(false);
    });

    it('should correctly identify investor role', () => {
      // Arrange
      const investorRole = UserRole.create('INVESTOR').getValue();
      const entrepreneurRole = UserRole.create('ENTREPRENEUR').getValue();

      // Act & Assert
      expect(investorRole.isInvestor()).toBe(true);
      expect(entrepreneurRole.isInvestor()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for roles with same value', () => {
      // Arrange
      const role1 = UserRole.create('ADMIN').getValue();
      const role2 = UserRole.create('ADMIN').getValue();

      // Act & Assert
      expect(role1.equals(role2)).toBe(true);
    });

    it('should return false for roles with different values', () => {
      // Arrange
      const adminRole = UserRole.create('ADMIN').getValue();
      const entrepreneurRole = UserRole.create('ENTREPRENEUR').getValue();

      // Act & Assert
      expect(adminRole.equals(entrepreneurRole)).toBe(false);
    });

    it('should return false when comparing with null or undefined', () => {
      // Arrange
      const role = UserRole.create('ADMIN').getValue();

      // Act & Assert
      expect(role.equals(null as any)).toBe(false);
      expect(role.equals(undefined as any)).toBe(false);
    });
  });
});
