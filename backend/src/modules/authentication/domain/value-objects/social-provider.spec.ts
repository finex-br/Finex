import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SocialProvider } from './social-provider';

describe('SocialProvider Value Object', () => {
  describe('OAuth Disabled', () => {
    it('should fail to create any provider (GITHUB)', () => {
      const result = SocialProvider.create('GITHUB');
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('OAuth authentication is currently disabled');
    });

    it('should fail to create any provider (GOOGLE)', () => {
      const result = SocialProvider.create('GOOGLE');
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('OAuth authentication is currently disabled');
    });

    it('should fail to create any provider (FACEBOOK)', () => {
      const result = SocialProvider.create('FACEBOOK');
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('OAuth authentication is currently disabled');
    });

    it('should fail with any input when OAuth is disabled', () => {
      const testCases = ['GITHUB', 'FACEBOOK', 'INVALID', '', null, undefined, '   '];
      
      testCases.forEach(testCase => {
        const result = SocialProvider.create(testCase as any);
        expect(result.isFailure).toBe(true);
        expect(result.error).toContain('OAuth authentication is currently disabled');
      });
    });
  });

  // NOTE: The following tests are kept for documentation purposes
  // but will be skipped since OAuth is currently disabled
  describe.skip('create (OAuth enabled - SKIPPED)', () => {
    // DISABLED: Google OAuth tests
    // it('should create a valid GOOGLE provider', () => {
    //   const providerOrError = SocialProvider.create('GITHUB');
    //   
    //   expect(providerOrError.isSuccess).toBe(true);
    //   expect(providerOrError.getValue().value).toBe('GITHUB');
    // });

    it('should create a valid GITHUB provider', () => {
      const providerOrError = SocialProvider.create('GITHUB');
      
      expect(providerOrError.isSuccess).toBe(true);
      expect(providerOrError.getValue().value).toBe('GITHUB');
    });

    it('should create a valid FACEBOOK provider', () => {
      const providerOrError = SocialProvider.create('FACEBOOK');
      
      expect(providerOrError.isSuccess).toBe(true);
      expect(providerOrError.getValue().value).toBe('FACEBOOK');
    });

    // DISABLED: Google OAuth test
    // it('should be case-insensitive for GOOGLE', () => {
    //   const providerOrError = SocialProvider.create('GITHUB');
    //   
    //   expect(providerOrError.isSuccess).toBe(true);
    //   expect(providerOrError.getValue().value).toBe('GITHUB');
    // });

    it('should be case-insensitive for mixed case', () => {
      const providerOrError = SocialProvider.create('GiThUb');
      
      expect(providerOrError.isSuccess).toBe(true);
      expect(providerOrError.getValue().value).toBe('GITHUB');
    });

    it('should fail with invalid provider', () => {
      const providerOrError = SocialProvider.create('TWITTER');
      
      expect(providerOrError.isFailure).toBe(true);
      expect(providerOrError.error).toContain('Invalid social provider');
    });

    it('should fail with empty string', () => {
      const providerOrError = SocialProvider.create('');
      
      expect(providerOrError.isFailure).toBe(true);
      expect(providerOrError.error).toContain('Social provider is required');
    });

    it('should fail with null', () => {
      const providerOrError = SocialProvider.create(null as any);
      
      expect(providerOrError.isFailure).toBe(true);
      expect(providerOrError.error).toContain('Social provider is required');
    });

    it('should fail with undefined', () => {
      const providerOrError = SocialProvider.create(undefined as any);
      
      expect(providerOrError.isFailure).toBe(true);
      expect(providerOrError.error).toContain('Social provider is required');
    });

    it('should fail with whitespace only', () => {
      const providerOrError = SocialProvider.create('   ');
      
      expect(providerOrError.isFailure).toBe(true);
      expect(providerOrError.error).toContain('Social provider is required');
    });
  });

  // NOTE: OAuth disabled - these helper tests are kept for documentation
  describe.skip('helper methods (OAuth disabled)', () => {
    // DISABLED: Google OAuth tests
    // it('should identify GOOGLE provider with isGoogle()', () => {
    //   const provider = SocialProvider.create('GITHUB').getValue();
    //   
    //   expect(provider.isGoogle()).toBe(true);
    //   expect(provider.isGitHub()).toBe(false);
    // });

    it('should fail to create any provider (OAuth disabled)', () => {
      const result = SocialProvider.create('GITHUB');
      
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('OAuth authentication is currently disabled');
    });
  });
});