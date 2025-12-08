import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

/**
 * DTO for linking a social account to existing user
 * @example
 * {
 *   "provider": "GOOGLE",
 *   "code": "4/0AY0e-g7...",
 *   "redirectUri": "https://example.com/callback"
 * }
 */
export class LinkSocialRequestDto {
  /**
   * OAuth provider name (GOOGLE, GITHUB, APPLE, FACEBOOK)
   * @example "GOOGLE"
   */
  @ApiProperty({
    description: 'OAuth provider name',
    example: 'GOOGLE',
    enum: ['GOOGLE', 'GITHUB', 'APPLE', 'FACEBOOK'],
    required: true,
  })
  @IsString()
  provider: string;

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
