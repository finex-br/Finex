import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SocialAccountId } from './social-account-id';

describe('SocialAccountId Value Object', () => {
  describe('create', () => {
    it('should create a valid social account id', () => {
      const idOrError = SocialAccountId.create('123456789');
      
      expect(idOrError.isSuccess).toBe(true);
      expect(idOrError.getValue().value).toBe('123456789');
    });

    it('should create with alphanumeric id', () => {
      const idOrError = SocialAccountId.create('abc123xyz789');
      
      expect(idOrError.isSuccess).toBe(true);
      expect(idOrError.getValue().value).toBe('abc123xyz789');
    });

    it('should create with special characters from providers', () => {
      const idOrError = SocialAccountId.create('user-123_456.789');
      
      expect(idOrError.isSuccess).toBe(true);
      expect(idOrError.getValue().value).toBe('user-123_456.789');
    });

    it('should trim whitespace', () => {
      const idOrError = SocialAccountId.create('  123456789  ');
      
      expect(idOrError.isSuccess).toBe(true);
      expect(idOrError.getValue().value).toBe('123456789');
    });

    it('should fail with empty string', () => {
      const idOrError = SocialAccountId.create('');
      
      expect(idOrError.isFailure).toBe(true);
      expect(idOrError.error).toContain('Social account ID is required');
    });

    it('should fail with whitespace only', () => {
      const idOrError = SocialAccountId.create('   ');
      
      expect(idOrError.isFailure).toBe(true);
      expect(idOrError.error).toContain('Social account ID is required');
    });

    it('should fail with null', () => {
      const idOrError = SocialAccountId.create(null as any);
      
      expect(idOrError.isFailure).toBe(true);
      expect(idOrError.error).toContain('Social account ID is required');
    });

    it('should fail with undefined', () => {
      const idOrError = SocialAccountId.create(undefined as any);
      
      expect(idOrError.isFailure).toBe(true);
      expect(idOrError.error).toContain('Social account ID is required');
    });
  });

  describe('equality', () => {
    it('should be equal when ids match', () => {
      const id1 = SocialAccountId.create('123456789').getValue();
      const id2 = SocialAccountId.create('123456789').getValue();
      
      expect(id1.equals(id2)).toBe(true);
    });

    it('should not be equal when ids differ', () => {
      const id1 = SocialAccountId.create('123456789').getValue();
      const id2 = SocialAccountId.create('987654321').getValue();
      
      expect(id1.equals(id2)).toBe(false);
    });
  });
});
