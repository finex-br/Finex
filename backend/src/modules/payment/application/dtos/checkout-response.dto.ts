import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for checkout operations
 */
export class CheckoutResponseDTO {
  @ApiProperty({ description: 'Unique checkout identifier' })
  checkoutId: string;

  @ApiProperty({ description: 'URL for completing the checkout' })
  checkoutUrl: string;

  @ApiProperty({ description: 'Amount in BRL' })
  amount: number;

  @ApiProperty({ description: 'Payment description' })
  description: string;

  @ApiProperty({ description: 'Current checkout status' })
  status: string;

  @ApiProperty({ description: 'Checkout expiration date', required: false })
  expiresAt?: Date;
}
