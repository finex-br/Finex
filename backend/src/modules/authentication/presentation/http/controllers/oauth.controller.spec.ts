import { Test, TestingModule } from '@nestjs/testing';
import { OAuthController } from './oauth.controller';
import { AuthenticateWithSocialUseCase } from '../../../application/use-cases/authenticate-with-social.use-case';
import { OAuthCallbackDto } from '../dtos/oauth-callback.dto';
import { SocialProvider } from '../../../domain/value-objects/social-provider';

describe('OAuthController', () => {
  let controller: OAuthController;
  let authenticateWithSocialUseCase: jest.Mocked<AuthenticateWithSocialUseCase>;

  const mockGoogleProvider = {
    getProvider: jest.fn().mockReturnValue('GOOGLE'),
    exchangeCodeForProfile: jest.fn(),
  };

  const mockGitHubProvider = {
    getProvider: jest.fn().mockReturnValue('GITHUB'),
    exchangeCodeForProfile: jest.fn(),
  };

  const mockFacebookProvider = {
    getProvider: jest.fn().mockReturnValue('FACEBOOK'),
    exchangeCodeForProfile: jest.fn(),
  };

  beforeEach(async () => {
    const mockAuthenticateUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OAuthController],
      providers: [
        {
          provide: AuthenticateWithSocialUseCase,
          useValue: mockAuthenticateUseCase,
        },
        {
          provide: 'GOOGLE_OAUTH_PROVIDER',
          useValue: mockGoogleProvider,
        },
        {
          provide: 'GITHUB_OAUTH_PROVIDER',
          useValue: mockGitHubProvider,
        },
        {
          provide: 'FACEBOOK_OAUTH_PROVIDER',
          useValue: mockFacebookProvider,
        },
      ],
    }).compile();

    controller = module.get<OAuthController>(OAuthController);
    authenticateWithSocialUseCase = module.get(AuthenticateWithSocialUseCase);
  });

  describe('callback', () => {
    it('should authenticate with Google', async () => {
      const callbackDto: OAuthCallbackDto = {
        code: 'auth-code-123',
        redirectUri: 'https://example.com/callback',
      };

      const mockResult = {
        accessToken: 'jwt-token',
        refreshToken: 'refresh-token',
        userId: 'user-id',
      };

      authenticateWithSocialUseCase.execute.mockResolvedValue({
        isSuccess: true,
        isFailure: false,
        getValue: () => mockResult,
        error: null,
      } as any);

      const result = await controller.callback('google', callbackDto);

      expect(result.accessToken).toBe('jwt-token');
      expect(result.userId).toBe('user-id');
      expect(authenticateWithSocialUseCase.execute).toHaveBeenCalledWith({
        provider: 'GOOGLE',
        code: 'auth-code-123',
        redirectUri: 'https://example.com/callback',
      });
    });

    it('should authenticate with GitHub', async () => {
      const callbackDto: OAuthCallbackDto = {
        code: 'github-code',
      };

      const mockResult = {
        accessToken: 'jwt-token-2',
        refreshToken: 'refresh-token-2',
        userId: 'user-id-2',
      };

      authenticateWithSocialUseCase.execute.mockResolvedValue({
        isSuccess: true,
        isFailure: false,
        getValue: () => mockResult,
        error: null,
      } as any);

      const result = await controller.callback('github', callbackDto);

      expect(result.accessToken).toBe('jwt-token-2');
      expect(authenticateWithSocialUseCase.execute).toHaveBeenCalledWith({
        provider: 'GITHUB',
        code: 'github-code',
        redirectUri: undefined,
      });
    });

    it('should authenticate with Facebook', async () => {
      const callbackDto: OAuthCallbackDto = {
        code: 'fb-code',
      };

      const mockResult = {
        accessToken: 'jwt-token-4',
        refreshToken: 'refresh-token-4',
        userId: 'user-id-4',
      };

      authenticateWithSocialUseCase.execute.mockResolvedValue({
        isSuccess: true,
        isFailure: false,
        getValue: () => mockResult,
        error: null,
      } as any);

      const result = await controller.callback('facebook', callbackDto);

      expect(result.accessToken).toBe('jwt-token-4');
    });

    it('should throw error for invalid provider', async () => {
      const callbackDto: OAuthCallbackDto = {
        code: 'some-code',
      };

      await expect(
        controller.callback('invalid', callbackDto),
      ).rejects.toThrow();
    });

    it('should throw error when authentication fails', async () => {
      const callbackDto: OAuthCallbackDto = {
        code: 'invalid-code',
      };

      authenticateWithSocialUseCase.execute.mockResolvedValue({
        isSuccess: false,
        isFailure: true,
        getValue: () => null,
        error: 'Invalid authorization code',
      } as any);

      await expect(
        controller.callback('google', callbackDto),
      ).rejects.toThrow('Invalid authorization code');
    });
  });
});
