import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

/**
 * DTO for OAuth callback
 * @example
 * {
 *   "code": "4/0AY0e-g7...",
 *   "redirectUri": "https://example.com/callback"
 * }
 */
export class OAuthCallbackDto {
  /**
   * Authorization code from OAuth provider
   * @example "4/0AY0e-g7QzQ..."
   */
  @ApiProperty({
    description: 'Authorization code from OAuth provider',
    example: '4/0AY0e-g7QzQZxW8...',
    required: true,
  })
  @IsString()
  code: string;

  /**
   * Optional state parameter for CSRF protection
   * @example "random-state-string"
   */
  @ApiProperty({
    description: 'Optional state parameter for CSRF protection',
    example: 'random-state-string',
    required: false,
  })
  @IsString()
  @IsOptional()
  state?: string;

  /**
   * Optional redirect URI used in the OAuth flow
   * @example "https://example.com/callback"
   */
  @ApiProperty({
    description: 'Optional redirect URI used in the OAuth flow',
    example: 'https://example.com/callback',
    required: false,
  })
  @IsString()
  @IsOptional()
  redirectUri?: string;
}
