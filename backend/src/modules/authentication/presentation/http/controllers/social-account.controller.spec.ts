import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { SocialAccountController } from './social-account.controller';
import { LinkSocialAccountUseCase } from '../../../application/use-cases/link-social-account.use-case';
import { UnlinkSocialAccountUseCase } from '../../../application/use-cases/unlink-social-account.use-case';
import { LinkSocialRequestDto } from '../dtos/link-social-request.dto';
import { UnlinkSocialRequestDto } from '../dtos/unlink-social-request.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

describe('SocialAccountController', () => {
  let controller: SocialAccountController;
  let linkSocialAccountUseCase: jest.Mocked<LinkSocialAccountUseCase>;
  let unlinkSocialAccountUseCase: jest.Mocked<UnlinkSocialAccountUseCase>;

  const mockgithubProvider = {
    getProvider: jest.fn().mockReturnValue('GITHUB'),
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
    const mockLinkUseCase = {
      execute: jest.fn(),
    };

    const mockUnlinkUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocialAccountController],
      providers: [
        {
          provide: LinkSocialAccountUseCase,
          useValue: mockLinkUseCase,
        },
        {
          provide: UnlinkSocialAccountUseCase,
          useValue: mockUnlinkUseCase,
        },
        {
          provide: 'GOOGLE_OAUTH_PROVIDER',
          useValue: mockgithubProvider,
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
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<SocialAccountController>(SocialAccountController);
    linkSocialAccountUseCase = module.get(LinkSocialAccountUseCase);
    unlinkSocialAccountUseCase = module.get(UnlinkSocialAccountUseCase);
  });

  describe('linkSocialAccount', () => {
    const mockRequest = {
      user: {
        userId: 'user-123',
      },
    };

    it('should link GitHub account', async () => {
      const dto: LinkSocialRequestDto = {
        provider: 'GITHUB',
        code: 'auth-code-123',
        redirectUri: 'https://example.com/callback',
      };

      linkSocialAccountUseCase.execute.mockResolvedValue({
        isSuccess: true,
        isFailure: false,
        getValue: () => undefined,
        error: null,
      } as any);

      await controller.linkSocialAccount(mockRequest, dto);

      expect(linkSocialAccountUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-123',
        provider: 'GITHUB',
        code: 'auth-code-123',
        redirectUri: 'https://example.com/callback',
      });
    });

    it('should link GitHub account', async () => {
      const dto: LinkSocialRequestDto = {
        provider: 'GITHUB',
        code: 'github-code',
      };

      linkSocialAccountUseCase.execute.mockResolvedValue({
        isSuccess: true,
        isFailure: false,
        getValue: () => undefined,
        error: null,
      } as any);

      await controller.linkSocialAccount(mockRequest, dto);

      expect(linkSocialAccountUseCase.execute).toHaveBeenCalled();
    });

    it('should throw error for invalid provider', async () => {
      const dto: LinkSocialRequestDto = {
        provider: 'INVALID',
        code: 'some-code',
      };

      await expect(
        controller.linkSocialAccount(mockRequest, dto),
      ).rejects.toThrow();
    });

    it('should throw error when already linked', async () => {
      const dto: LinkSocialRequestDto = {
        provider: 'GITHUB',
        code: 'auth-code',
      };

      linkSocialAccountUseCase.execute.mockResolvedValue({
        isSuccess: false,
        isFailure: true,
        getValue: () => null,
        error: 'Social account already linked',
      } as any);

      await expect(
        controller.linkSocialAccount(mockRequest, dto),
      ).rejects.toThrow('Social account already linked');
    });
  });

  describe('unlinkSocialAccount', () => {
    const mockRequest = {
      user: {
        userId: 'user-123',
      },
    };

    it('should unlink GitHub account', async () => {
      const dto: UnlinkSocialRequestDto = {
        provider: 'GITHUB',
      };

      unlinkSocialAccountUseCase.execute.mockResolvedValue({
        isSuccess: true,
        isFailure: false,
        getValue: () => undefined,
        error: null,
      } as any);

      await controller.unlinkSocialAccount(mockRequest, dto);

      expect(unlinkSocialAccountUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-123',
        provider: 'GITHUB',
      });
    });

    it('should unlink GitHub account', async () => {
      const dto: UnlinkSocialRequestDto = {
        provider: 'GITHUB',
      };

      unlinkSocialAccountUseCase.execute.mockResolvedValue({
        isSuccess: true,
        isFailure: false,
        getValue: () => undefined,
        error: null,
      } as any);

      await controller.unlinkSocialAccount(mockRequest, dto);

      expect(unlinkSocialAccountUseCase.execute).toHaveBeenCalled();
    });

    it('should throw error for invalid provider', async () => {
      const dto: UnlinkSocialRequestDto = {
        provider: 'INVALID',
      };

      await expect(
        controller.unlinkSocialAccount(mockRequest, dto),
      ).rejects.toThrow();
    });

    it('should throw error when account not linked', async () => {
      const dto: UnlinkSocialRequestDto = {
        provider: 'GITHUB',
      };

      unlinkSocialAccountUseCase.execute.mockResolvedValue({
        isSuccess: false,
        isFailure: true,
        getValue: () => null,
        error: 'Social account not found',
      } as any);

      await expect(
        controller.unlinkSocialAccount(mockRequest, dto),
      ).rejects.toThrow('Social account not found');
    });
  });
});
