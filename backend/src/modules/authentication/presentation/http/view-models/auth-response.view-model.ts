import { ApiProperty } from '@nestjs/swagger';

class UserViewModel {
  @ApiProperty({ description: 'User ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'User name', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'User phone number', example: '+5511999999999' })
  phoneNumber: string;

  @ApiProperty({ description: 'User role', example: 'USER' })
  role: string;

  @ApiProperty({ description: 'Account creation date', example: '2025-12-08T00:00:00.000Z' })
  createdAt: Date;
}

export class AuthResponseViewModel {
  @ApiProperty({ description: 'JWT access token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  token: string;

  @ApiProperty({ description: 'User information', type: UserViewModel })
  user: UserViewModel;
}
