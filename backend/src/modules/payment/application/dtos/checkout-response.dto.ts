import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for checkout operations
 */
export class CheckoutResponseDTO {
  @ApiProperty()
  checkoutId: string;

  @ApiProperty()
  checkoutUrl: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false })
  expiresAt?: Date;
}
