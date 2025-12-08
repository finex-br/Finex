import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for OAuth authentication response
 * @example
 * {
 *   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "userId": "550e8400-e29b-41d4-a716-446655440000",
 *   "email": "user@example.com",
 *   "isNewUser": false
 * }
 */
export class OAuthResponseDto {
  /**
   * JWT access token
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  @ApiProperty({
    description: 'JWT access token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  /**
   * User ID
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @ApiProperty({
    description: 'Unique user identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId: string;

  /**
   * User email address
   * @example "user@example.com"
   */
  @ApiProperty({
    description: 'User email address',
    example: 'user@gmail.com',
  })
  email: string;

  /**
   * Whether this is a newly registered user
   * @example false
   */
  @ApiProperty({
    description: 'Indicates if this is a newly registered user',
    example: false,
  })
  isNewUser: boolean;
}
