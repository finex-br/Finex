import { UserMapper } from './user.mapper';
import { UserSchema } from '../entities/user.schema';
import { User } from '../../../../domain/entities/user';
import { Email } from '../../../../domain/value-objects/email';
import { Password } from '../../../../domain/value-objects/password';
import { UserRole } from '../../../../domain/value-objects/user-role';
import { UniqueEntityID } from '../../../../../../shared/core/unique-entity-id';

describe('UserMapper', () => {
  describe('toPersistence', () => {
    it('should map User entity to UserSchema', async () => {
      // Arrange
      const email = Email.create('user@example.com').getValue();
      const password = (await Password.create('StrongPass123!')).getValue();
      const role = UserRole.create('ENTREPRENEUR').getValue();
      
      const user = User.create({
        email,
        password,
        name: 'John Doe',
        role,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      }, new UniqueEntityID('test-id-123')).getValue();

      // Act
      const schema = await UserMapper.toPersistence(user);

      // Assert
      expect(schema.id).toBe('test-id-123');
      expect(schema.email).toBe('user@example.com');
      expect(schema.password).toBeDefined();
      expect(schema.password).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash
      expect(schema.name).toBe('John Doe');
      expect(schema.role).toBe('ENTREPRENEUR');
      expect(schema.isActive).toBe(true);
      expect(schema.createdAt).toEqual(new Date('2024-01-01'));
      expect(schema.updatedAt).toEqual(new Date('2024-01-02'));
    });
  });

  describe('toDomain', () => {
    it('should map UserSchema to User entity', async () => {
      // Arrange
      const hashedPassword = (await Password.create('StrongPass123!')).getValue().value;
      
      const schema = new UserSchema();
      schema.id = 'test-id-456';
      schema.email = 'user@example.com';
      schema.password = hashedPassword;
      schema.name = 'Jane Doe';
      schema.role = 'INVESTOR';
      schema.isActive = true;
      schema.createdAt = new Date('2024-01-01');
      schema.updatedAt = new Date('2024-01-02');

      // Act
      const user = await UserMapper.toDomain(schema);

      // Assert
      expect(user).not.toBeNull();
      expect(user!.id.toString()).toBe('test-id-456');
      expect(user!.email.value).toBe('user@example.com');
      expect(user!.password.value).toBe(hashedPassword);
      expect(user!.name).toBe('Jane Doe');
      expect(user!.role.value).toBe('INVESTOR');
      expect(user!.isActive).toBe(true);
    });

    it('should return null when email is invalid', async () => {
      // Arrange
      const hashedPassword = (await Password.create('StrongPass123!')).getValue().value;
      
      const schema = new UserSchema();
      schema.id = 'test-id-789';
      schema.email = 'invalid-email';
      schema.password = hashedPassword;
      schema.name = 'John Doe';
      schema.role = 'ADMIN';
      schema.isActive = true;
      schema.createdAt = new Date();
      schema.updatedAt = new Date();

      // Act
      const user = await UserMapper.toDomain(schema);

      // Assert
      expect(user).toBeNull();
    });

    it('should return null when role is invalid', async () => {
      // Arrange
      const hashedPassword = (await Password.create('StrongPass123!')).getValue().value;
      
      const schema = new UserSchema();
      schema.id = 'test-id-999';
      schema.email = 'user@example.com';
      schema.password = hashedPassword;
      schema.name = 'John Doe';
      schema.role = 'INVALID_ROLE';
      schema.isActive = true;
      schema.createdAt = new Date();
      schema.updatedAt = new Date();

      // Act
      const user = await UserMapper.toDomain(schema);

      // Assert
      expect(user).toBeNull();
    });
  });
});
