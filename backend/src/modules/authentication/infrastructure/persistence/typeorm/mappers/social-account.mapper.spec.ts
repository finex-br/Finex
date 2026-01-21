import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SocialAccountMapper } from './social-account.mapper';
import { SocialAccount } from '../../../../domain/entities/social-account';
import { SocialAccountSchema } from '../schemas/social-account.schema';
import { SocialProvider } from '../../../../domain/value-objects/social-provider';
import { SocialAccountId } from '../../../../domain/value-objects/social-account-id';
import { Email } from '../../../../domain/value-objects/email';
import { UniqueEntityID } from '../../../../../../shared/core/unique-entity-id';

describe('SocialAccountMapper', () => {
  describe('toDomain', () => {
    it('should map schema to domain entity', () => {
      const schema: SocialAccountSchema = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        provider: 'GITHUB',
        providerId: 'github123',
        email: 'user@github.com',
        displayName: 'John Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        user: null as any,
      };

      const result = SocialAccountMapper.toDomain(schema);

      expect(result.isSuccess).toBe(true);
      const account = result.getValue();
      expect(account.id.toString()).toBe(schema.id);
      expect(account.userId.toString()).toBe(schema.userId);
      expect(account.provider.value).toBe('GITHUB');
      expect(account.providerId.value).toBe('github123');
      expect(account.email.value).toBe('user@github.com');
      expect(account.displayName).toBe('John Doe');
      expect(account.avatarUrl).toBe('https://example.com/avatar.jpg');
    });

    it('should map schema without avatar url', () => {
      const schema: SocialAccountSchema = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        provider: 'GITHUB',
        providerId: 'github456',
        email: 'user@github.com',
        displayName: 'Jane Doe',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        user: null as any,
      };

      const result = SocialAccountMapper.toDomain(schema);

      expect(result.isSuccess).toBe(true);
      const account = result.getValue();
      expect(account.avatarUrl).toBeUndefined();
    });

    it('should fail with invalid provider', () => {
      const schema: SocialAccountSchema = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        provider: 'INVALID',
        providerId: 'invalid123',
        email: 'user@example.com',
        displayName: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: null as any,
      };

      const result = SocialAccountMapper.toDomain(schema);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('provider');
    });

    it('should fail with invalid email', () => {
      const schema: SocialAccountSchema = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        provider: 'GITHUB',
        providerId: 'github123',
        email: 'invalid-email',
        displayName: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: null as any,
      };

      const result = SocialAccountMapper.toDomain(schema);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeDefined();
    });
  });

  describe('toPersistence', () => {
    it('should map domain entity to schema', () => {
      const provider = SocialProvider.create('GITHUB').getValue();
      const providerId = SocialAccountId.create('github123').getValue();
      const email = Email.create('user@github.com').getValue();
      const userId = new UniqueEntityID('123e4567-e89b-12d3-a456-426614174001');
      
      const account = SocialAccount.create({
        userId,
        provider,
        providerId,
        email,
        displayName: 'John Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      }, new UniqueEntityID('123e4567-e89b-12d3-a456-426614174000')).getValue();

      const schema = SocialAccountMapper.toPersistence(account);

      expect(schema.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(schema.userId).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(schema.provider).toBe('GITHUB');
      expect(schema.providerId).toBe('github123');
      expect(schema.email).toBe('user@github.com');
      expect(schema.displayName).toBe('John Doe');
      expect(schema.avatarUrl).toBe('https://example.com/avatar.jpg');
    });

    it('should map domain entity without avatar url', () => {
      const provider = SocialProvider.create('FACEBOOK').getValue();
      const providerId = SocialAccountId.create('fb789').getValue();
      const email = Email.create('user@facebook.com').getValue();
      const userId = new UniqueEntityID('123e4567-e89b-12d3-a456-426614174001');
      
      const account = SocialAccount.create({
        userId,
        provider,
        providerId,
        email,
        displayName: 'Jane Smith',
      }, new UniqueEntityID('123e4567-e89b-12d3-a456-426614174000')).getValue();

      const schema = SocialAccountMapper.toPersistence(account);

      expect(schema.avatarUrl).toBeUndefined();
      expect(schema.displayName).toBe('Jane Smith');
    });

    it('should map all supported providers', () => {
      const providers = ['GITHUB', 'FACEBOOK']; // DISABLED: GOOGLE
      
      providers.forEach(providerName => {
        const provider = SocialProvider.create(providerName).getValue();
        const providerId = SocialAccountId.create(`${providerName.toLowerCase()}123`).getValue();
        const email = Email.create('user@example.com').getValue();
        const userId = new UniqueEntityID('user-id');
        
        const account = SocialAccount.create({
          userId,
          provider,
          providerId,
          email,
          displayName: 'Test User',
        }).getValue();

        const schema = SocialAccountMapper.toPersistence(account);

        expect(schema.provider).toBe(providerName);
      });
    });
  });
});
