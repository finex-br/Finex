import {
  Controller,
  Post,
  Delete,
  Body,
  Request,
  UseGuards,
  Inject,
  BadRequestException,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LinkSocialAccountUseCase } from '../../../application/use-cases/link-social-account.use-case';
import { UnlinkSocialAccountUseCase } from '../../../application/use-cases/unlink-social-account.use-case';
import { LinkSocialRequestDto } from '../dtos/link-social-request.dto';
import { UnlinkSocialRequestDto } from '../dtos/unlink-social-request.dto';
import { IOAuthProvider } from '../../../application/ports/oauth-provider.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

/**
 * Controller for managing social account connections
 * Allows authenticated users to link/unlink OAuth social accounts
 * 
 * @tag Authentication
 * @requires Authentication - All endpoints require valid JWT token
 */
@ApiTags('Social Account')
@ApiBearerAuth('JWT-auth')
@Controller('auth/social-account')
@UseGuards(JwtAuthGuard)
export class SocialAccountController {
  private readonly providers: Map<string, IOAuthProvider>;

  constructor(
    private readonly linkSocialAccountUseCase: LinkSocialAccountUseCase,
    private readonly unlinkSocialAccountUseCase: UnlinkSocialAccountUseCase,
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
   * Link a social account to the authenticated user
   * Allows users to connect multiple OAuth providers to their account
   * 
   * @param req - Request object containing authenticated user info
   * @param dto - Provider name, authorization code, and optional redirect URI
   * @returns void (204 No Content on success)
   * 
   * @example
   * POST /auth/social-account/link
   * Headers: { "Authorization": "Bearer <jwt_token>" }
   * Body: {
   *   "provider": "GITHUB",
   *   "code": "4/0AY0e-g7...",
   *   "redirectUri": "https://example.com/callback"
   * }
   * 
   * @throws BadRequestException if provider is not supported or account is already linked
   */
  @Post('link')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Link social account',
    description: 'Link a social OAuth account to the authenticated user',
  })
  @ApiBody({ type: LinkSocialRequestDto })
  @ApiResponse({
    status: 204,
    description: 'Social account linked successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Provider not supported or account already linked',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  async linkSocialAccount(
    @Request() req: any,
    @Body() dto: LinkSocialRequestDto,
  ): Promise<void> {
    const userId = req.user?.sub || req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('User ID not found in token');
    }

    const provider = this.providers.get(dto.provider.toLowerCase());

    if (!provider) {
      throw new BadRequestException(`Provider ${dto.provider} is not supported`);
    }

    try {
      // Link social account to user
      const result = await this.linkSocialAccountUseCase.execute({
        userId,
        provider: provider.getProvider(),
        code: dto.code,
        redirectUri: dto.redirectUri,
      });

      if (result.isFailure) {
        throw new BadRequestException(result.error);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Unlink a social account from the authenticated user
   * Removes the connection between the user's account and an OAuth provider
   * 
   * @param req - Request object containing authenticated user info
   * @param dto - Provider name to unlink
   * @returns void (204 No Content on success)
   * 
   * @example
   * DELETE /auth/social-account/unlink
   * Headers: { "Authorization": "Bearer <jwt_token>" }
   * Body: { "provider": "GITHUB" }
   * 
   * @throws BadRequestException if provider is not supported or account is not linked
   */
  @Delete('unlink')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Unlink social account',
    description: 'Unlink a social OAuth account from the authenticated user',
  })
  @ApiBody({ type: UnlinkSocialRequestDto })
  @ApiResponse({
    status: 204,
    description: 'Social account unlinked successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Provider not supported or account not linked',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  async unlinkSocialAccount(
    @Request() req: any,
    @Body() dto: UnlinkSocialRequestDto,
  ): Promise<void> {
    const userId = req.user?.sub || req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('User ID not found in token');
    }

    try {
      const result = await this.unlinkSocialAccountUseCase.execute({
        userId,
        provider: dto.provider,
      });

      if (result.isFailure) {
        throw new BadRequestException(result.error);
      }
    } catch (error) {
      throw error;
    }
  }
}
