import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SocialProvider } from './social-provider';

describe('SocialProvider Value Object', () => {
  describe('create', () => {
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

  describe('helper methods', () => {
    // DISABLED: Google OAuth tests
    // it('should identify GOOGLE provider with isGoogle()', () => {
    //   const provider = SocialProvider.create('GITHUB').getValue();
    //   
    //   expect(provider.isGoogle()).toBe(true);
    //   expect(provider.isGitHub()).toBe(false);
    // });

    it('should identify GITHUB provider with isGitHub()', () => {
      const provider = SocialProvider.create('GITHUB').getValue();
      
      // DISABLED: isGoogle() method
      // expect(provider.isGoogle()).toBe(false);
      expect(provider.isGitHub()).toBe(true);
    });
  });
});
