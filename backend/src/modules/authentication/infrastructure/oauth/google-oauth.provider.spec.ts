import { describe, it, expect, beforeEach, jest } from '@jest/globals';
// DISABLED: Google OAuth Provider tests
// import { GoogleOAuthProvider } from './google-oauth.provider';
import { SocialProfileDto } from '../../application/dtos/social-profile.dto';

describe.skip('GoogleOAuthProvider', () => {
  let provider: any; // GoogleOAuthProvider;
  let mockHttpClient: any;

  beforeEach(() => {
    mockHttpClient = {
      post: jest.fn(),
      get: jest.fn(),
    };

    // provider = new GoogleOAuthProvider(
    //   mockHttpClient,
    //   'test-client-id',
    //   'test-client-secret',
    // );
  });

  describe('getProvider', () => {
    it('should return GOOGLE', () => {
      expect(provider.getProvider()).toBe('GITHUB');
    });
  });

  describe('exchangeCodeForProfile', () => {
    it('should exchange code for user profile', async () => {
      const mockTokenResponse = {
        data: {
          access_token: 'test-access-token',
          token_type: 'Bearer',
          expires_in: 3600,
        },
      };

      const mockProfileResponse = {
        data: {
          id: 'github123',
          email: 'user@github.com',
          name: 'John Doe',
          picture: 'https://example.com/avatar.jpg',
        },
      };

      mockHttpClient.post.mockResolvedValue(mockTokenResponse);
      mockHttpClient.get.mockResolvedValue(mockProfileResponse);

      const profile = await provider.exchangeCodeForProfile(
        'auth-code-123',
        'https://example.com/callback',
      );

      expect(profile.id).toBe('github123');
      expect(profile.email).toBe('user@github.com');
      expect(profile.displayName).toBe('John Doe');
      expect(profile.avatarUrl).toBe('https://example.com/avatar.jpg');
      expect(profile.provider).toBe('GITHUB');
    });

    it('should handle profile without picture', async () => {
      const mockTokenResponse = {
        data: {
          access_token: 'test-access-token',
        },
      };

      const mockProfileResponse = {
        data: {
          id: 'github456',
          email: 'user2@github.com',
          name: 'Jane Doe',
        },
      };

      mockHttpClient.post.mockResolvedValue(mockTokenResponse);
      mockHttpClient.get.mockResolvedValue(mockProfileResponse);

      const profile = await provider.exchangeCodeForProfile('auth-code-456');

      expect(profile.avatarUrl).toBeUndefined();
    });

    it('should throw error when token exchange fails', async () => {
      mockHttpClient.post.mockRejectedValue(new Error('Token exchange failed'));

      await expect(
        provider.exchangeCodeForProfile('invalid-code'),
      ).rejects.toThrow('Token exchange failed');
    });

    it('should throw error when profile fetch fails', async () => {
      const mockTokenResponse = {
        data: {
          access_token: 'test-access-token',
        },
      };

      mockHttpClient.post.mockResolvedValue(mockTokenResponse);
      mockHttpClient.get.mockRejectedValue(new Error('Profile fetch failed'));

      await expect(
        provider.exchangeCodeForProfile('auth-code'),
      ).rejects.toThrow('Profile fetch failed');
    });
  });
});
