import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  BadRequestException,
  Inject,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AuthenticateWithSocialUseCase } from '../../../application/use-cases/authenticate-with-social.use-case';
import { OAuthCallbackDto } from '../dtos/oauth-callback.dto';
import { OAuthResponseDto } from '../dtos/oauth-response.dto';
import { IOAuthProvider } from '../../../application/ports/oauth-provider.interface';
import { SocialProvider } from '../../../domain/value-objects/social-provider';

/**
 * Controller for OAuth authentication callbacks
 * Handles authentication via GitHub and Facebook OAuth providers
 * NOTE: Google OAuth is currently disabled
 * 
 * @tag Authentication
 */
@ApiTags('OAuth')
@Controller('auth/oauth')
export class OAuthController {
  private readonly providers: Map<string, IOAuthProvider>;

  constructor(
    private readonly authenticateWithSocialUseCase: AuthenticateWithSocialUseCase,
    // ALL OAUTH PROVIDERS DISABLED - Only email/password login active
    // @Inject('GOOGLE_OAUTH_PROVIDER')
    // private readonly googleProvider: IOAuthProvider,
    // @Inject('GITHUB_OAUTH_PROVIDER')
    // private readonly githubProvider: IOAuthProvider,
    // @Inject('FACEBOOK_OAUTH_PROVIDER')
    // private readonly facebookProvider: IOAuthProvider,
  ) {
    this.providers = new Map([
      // ALL OAUTH PROVIDERS DISABLED
      // ['google', this.googleProvider],
      // ['github', this.githubProvider],
      // ['facebook', this.facebookProvider],
    ]);
  }

  /**
   * OAuth callback endpoint
   * Receives authorization code from OAuth provider and authenticates/registers user
   * 
   * @param provider - OAuth provider name (github, facebook)
   * @param callbackDto - Authorization code and optional redirect URI
   * @returns Access token and user information
   * 
   * @example
   * POST /auth/oauth/google/callback
   * Body: { "code": "4/0AY0e-g7...", "redirectUri": "https://example.com/callback" }
   * 
   * Response: {
   *   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "userId": "550e8400-e29b-41d4-a716-446655440000",
   *   "email": "user@gmail.com",
   *   "isNewUser": false
   * }
   * 
   * @throws BadRequestException if provider is not supported or authentication fails
   */
  @Post(':provider/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'OAuth callback endpoint',
    description:
      'Receives authorization code from OAuth provider and authenticates/registers user',
  })
  @ApiParam({
    name: 'provider',
    description: 'OAuth provider name',
    enum: ['github', 'facebook'],
    example: 'github',
  })
  @ApiBody({ type: OAuthCallbackDto })
  @ApiResponse({
    status: 200,
    description: 'User authenticated successfully',
    type: OAuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Provider not supported or authentication failed',
  })
  async callback(
    @Param('provider') providerName: string,
    @Body() callbackDto: OAuthCallbackDto,
  ): Promise<OAuthResponseDto> {
    const provider = this.providers.get(providerName.toLowerCase());

    if (!provider) {
      throw new BadRequestException(
        `Provider ${providerName} is not supported`,
      );
    }

    try {
      // Authenticate or register user
      const result = await this.authenticateWithSocialUseCase.execute({
        provider: provider.getProvider(),
        code: callbackDto.code,
        redirectUri: callbackDto.redirectUri,
      });

      if (result.isFailure) {
        throw new BadRequestException(result.error);
      }

      const data = result.getValue();

      return {
        accessToken: data.accessToken,
        userId: data.userId,
        email: '', // TODO: Include email in Use Case response
        isNewUser: false, // TODO: add isNewUser to response
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * OAuth callback endpoint (GET)
   * Receives authorization code from OAuth provider via redirect
   * 
   * @param provider - OAuth provider name
   * @param code - Authorization code from OAuth provider
   * @param state - State parameter for CSRF protection
   * @returns Access token and user information
   */
  @Get(':provider/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'OAuth callback endpoint (GET)',
    description: 'Handles OAuth redirect with authorization code in query params',
  })
  @ApiParam({
    name: 'provider',
    description: 'OAuth provider name',
    enum: ['github', 'facebook'],
  })
  @ApiResponse({
    status: 200,
    description: 'User authenticated successfully',
    type: OAuthResponseDto,
  })
  async callbackGet(
    @Param('provider') providerName: string,
    @Query('code') code: string,
    @Query('state') state?: string,
  ): Promise<OAuthResponseDto> {
    return this.callback(providerName, { 
      code,
      redirectUri: `http://localhost:3000/auth/oauth/${providerName}/callback`
    });
  }
}
