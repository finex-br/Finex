import { FacebookOAuthProvider } from './facebook-oauth.provider';
import { SocialProfileDto } from '../../application/dtos/social-profile.dto';

describe('FacebookOAuthProvider', () => {
  let provider: FacebookOAuthProvider;
  let mockHttpClient: any;

  beforeEach(() => {
    mockHttpClient = {
      post: jest.fn(),
      get: jest.fn(),
    };

    provider = new FacebookOAuthProvider(
      mockHttpClient,
      'test-client-id',
      'test-client-secret',
    );
  });

  describe('getProvider', () => {
    it('should return FACEBOOK', () => {
      expect(provider.getProvider()).toBe('FACEBOOK');
    });
  });

  describe('exchangeCodeForProfile', () => {
    it('should exchange code for user profile', async () => {
      const mockTokenResponse = {
        data: {
          access_token: 'test-access-token',
          token_type: 'bearer',
          expires_in: 5184000,
        },
      };

      const mockProfileResponse = {
        data: {
          id: 'facebook123',
          email: 'user@facebook.com',
          name: 'John Doe',
          picture: {
            data: {
              url: 'https://graph.facebook.com/v12.0/123/picture',
            },
          },
        },
      };

      mockHttpClient.get.mockResolvedValueOnce(mockTokenResponse);
      mockHttpClient.get.mockResolvedValueOnce(mockProfileResponse);

      const profile = await provider.exchangeCodeForProfile(
        'auth-code-123',
        'https://example.com/callback',
      );

      expect(profile.id).toBe('facebook123');
      expect(profile.email).toBe('user@facebook.com');
      expect(profile.displayName).toBe('John Doe');
      expect(profile.avatarUrl).toBe('https://graph.facebook.com/v12.0/123/picture');
      expect(profile.provider).toBe('FACEBOOK');
    });

    it('should handle profile without picture', async () => {
      const mockTokenResponse = {
        data: {
          access_token: 'test-access-token',
        },
      };

      const mockProfileResponse = {
        data: {
          id: 'facebook456',
          email: 'user2@facebook.com',
          name: 'Jane Doe',
        },
      };

      mockHttpClient.get.mockResolvedValueOnce(mockTokenResponse);
      mockHttpClient.get.mockResolvedValueOnce(mockProfileResponse);

      const profile = await provider.exchangeCodeForProfile('auth-code-456');

      expect(profile.avatarUrl).toBeUndefined();
    });

    it('should handle nested picture data structure', async () => {
      const mockTokenResponse = {
        data: {
          access_token: 'test-access-token',
        },
      };

      const mockProfileResponse = {
        data: {
          id: 'facebook789',
          email: 'user3@facebook.com',
          name: 'User Three',
          picture: {
            data: {
              url: 'https://example.com/picture.jpg',
            },
          },
        },
      };

      mockHttpClient.get.mockResolvedValueOnce(mockTokenResponse);
      mockHttpClient.get.mockResolvedValueOnce(mockProfileResponse);

      const profile = await provider.exchangeCodeForProfile('auth-code-789');

      expect(profile.avatarUrl).toBe('https://example.com/picture.jpg');
    });

    it('should throw error when token exchange fails', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Token exchange failed'));

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

      mockHttpClient.get.mockResolvedValueOnce(mockTokenResponse);
      mockHttpClient.get.mockRejectedValue(new Error('Profile fetch failed'));

      await expect(
        provider.exchangeCodeForProfile('auth-code'),
      ).rejects.toThrow('Profile fetch failed');
    });
  });
});
