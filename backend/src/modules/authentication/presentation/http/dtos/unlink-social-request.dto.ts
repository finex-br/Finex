import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * DTO for unlinking a social account from user
 * @example
 * {
 *   "provider": "GOOGLE"
 * }
 */
export class UnlinkSocialRequestDto {
  /**
   * OAuth provider name to unlink (GOOGLE, GITHUB, APPLE, FACEBOOK)
   * @example "GOOGLE"
   */
  @ApiProperty({
    description: 'OAuth provider name to unlink',
    example: 'GOOGLE',
    enum: ['GOOGLE', 'GITHUB', 'APPLE', 'FACEBOOK'],
    required: true,
  })
  @IsString()
  provider: string;
}
