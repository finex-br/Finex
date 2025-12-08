import { GitHubOAuthProvider } from './github-oauth.provider';
import { SocialProfileDto } from '../../application/dtos/social-profile.dto';

describe('GitHubOAuthProvider', () => {
  let provider: GitHubOAuthProvider;
  let mockHttpClient: any;

  beforeEach(() => {
    mockHttpClient = {
      post: jest.fn(),
      get: jest.fn(),
    };

    provider = new GitHubOAuthProvider(
      mockHttpClient,
      'test-client-id',
      'test-client-secret',
    );
  });

  describe('getProvider', () => {
    it('should return GITHUB', () => {
      expect(provider.getProvider()).toBe('GITHUB');
    });
  });

  describe('exchangeCodeForProfile', () => {
    it('should exchange code for user profile', async () => {
      const mockTokenResponse = {
        data: {
          access_token: 'test-access-token',
          token_type: 'bearer',
          scope: 'read:user,user:email',
        },
      };

      const mockProfileResponse = {
        data: {
          id: 'github123',
          email: 'user@github.com',
          name: 'John Doe',
          avatar_url: 'https://avatars.githubusercontent.com/u/123',
          login: 'johndoe',
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
      expect(profile.avatarUrl).toBe('https://avatars.githubusercontent.com/u/123');
      expect(profile.provider).toBe('GITHUB');
    });

    it('should use login as displayName when name is null', async () => {
      const mockTokenResponse = {
        data: {
          access_token: 'test-access-token',
        },
      };

      const mockProfileResponse = {
        data: {
          id: 'github456',
          email: 'user2@github.com',
          name: null,
          login: 'janedoe',
        },
      };

      mockHttpClient.post.mockResolvedValue(mockTokenResponse);
      mockHttpClient.get.mockResolvedValue(mockProfileResponse);

      const profile = await provider.exchangeCodeForProfile('auth-code-456');

      expect(profile.displayName).toBe('janedoe');
    });

    it('should handle profile without avatar', async () => {
      const mockTokenResponse = {
        data: {
          access_token: 'test-access-token',
        },
      };

      const mockProfileResponse = {
        data: {
          id: 'github789',
          email: 'user3@github.com',
          name: 'User Three',
          login: 'user3',
        },
      };

      mockHttpClient.post.mockResolvedValue(mockTokenResponse);
      mockHttpClient.get.mockResolvedValue(mockProfileResponse);

      const profile = await provider.exchangeCodeForProfile('auth-code-789');

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
