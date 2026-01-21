import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * DTO for unlinking a social account from user
 * @example
 * {
 *   "provider": "GITHUB"
 * }
 */
export class UnlinkSocialRequestDto {
  /**
   * OAuth provider name to unlink (GITHUB, FACEBOOK)
   * @example "GITHUB"
   */
  @ApiProperty({
    description: 'OAuth provider name to unlink',
    example: 'GITHUB',
    enum: ['GITHUB', 'FACEBOOK'],
    required: true,
  })
  @IsString()
  provider: string;
}
