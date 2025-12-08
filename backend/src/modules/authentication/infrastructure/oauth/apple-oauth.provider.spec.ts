import { AppleOAuthProvider } from './apple-oauth.provider';
import { SocialProfileDto } from '../../application/dtos/social-profile.dto';

describe('AppleOAuthProvider', () => {
  let provider: AppleOAuthProvider;
  let mockHttpClient: any;

  beforeEach(() => {
    mockHttpClient = {
      post: jest.fn(),
      get: jest.fn(),
    };

    provider = new AppleOAuthProvider(
      mockHttpClient,
      'test-client-id',
      'test-team-id',
      'test-key-id',
      'test-private-key',
    );
  });

  describe('getProvider', () => {
    it('should return APPLE', () => {
      expect(provider.getProvider()).toBe('APPLE');
    });
  });

  describe('exchangeCodeForProfile', () => {
    it('should exchange code for user profile', async () => {
      // Create a valid JWT-like token
      const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'test' })).toString('base64');
      const payload = Buffer.from(JSON.stringify({
        sub: 'apple123',
        email: 'user@icloud.com',
        email_verified: true,
      })).toString('base64');
      const signature = 'test-signature';
      const idToken = `${header}.${payload}.${signature}`;

      const mockTokenResponse = {
        data: {
          access_token: 'test-access-token',
          token_type: 'Bearer',
          expires_in: 3600,
          id_token: idToken,
        },
      };

      mockHttpClient.post.mockResolvedValue(mockTokenResponse);

      const profile = await provider.exchangeCodeForProfile(
        'auth-code-123',
        'https://example.com/callback',
      );

      expect(profile.id).toBe('apple123');
      expect(profile.email).toBe('user@icloud.com');
      expect(profile.provider).toBe('APPLE');
    });

    it('should handle user info from request body', async () => {
      const header = Buffer.from(JSON.stringify({ alg: 'RS256' })).toString('base64');
      const payload = Buffer.from(JSON.stringify({
        sub: 'apple456',
        email: 'user2@icloud.com',
      })).toString('base64');
      const idToken = `${header}.${payload}.signature`;

      const mockTokenResponse = {
        data: {
          access_token: 'test-access-token',
          id_token: idToken,
        },
      };

      mockHttpClient.post.mockResolvedValue(mockTokenResponse);

      const profile = await provider.exchangeCodeForProfile(
        'auth-code-456',
        undefined,
        { name: { firstName: 'John', lastName: 'Doe' } },
      );

      expect(profile.displayName).toBe('John Doe');
    });

    it('should use email as displayName when name not provided', async () => {
      const header = Buffer.from(JSON.stringify({ alg: 'RS256' })).toString('base64');
      const payload = Buffer.from(JSON.stringify({
        sub: 'apple789',
        email: 'user3@icloud.com',
      })).toString('base64');
      const idToken = `${header}.${payload}.signature`;

      const mockTokenResponse = {
        data: {
          access_token: 'test-access-token',
          id_token: idToken,
        },
      };

      mockHttpClient.post.mockResolvedValue(mockTokenResponse);

      const profile = await provider.exchangeCodeForProfile('auth-code-789');

      expect(profile.displayName).toBe('user3@icloud.com');
    });

    it('should throw error when token exchange fails', async () => {
      mockHttpClient.post.mockRejectedValue(new Error('Token exchange failed'));

      await expect(
        provider.exchangeCodeForProfile('invalid-code'),
      ).rejects.toThrow('Token exchange failed');
    });

    it('should throw error when id_token is missing', async () => {
      const mockTokenResponse = {
        data: {
          access_token: 'test-access-token',
        },
      };

      mockHttpClient.post.mockResolvedValue(mockTokenResponse);

      await expect(
        provider.exchangeCodeForProfile('auth-code'),
      ).rejects.toThrow();
    });
  });
});
