/**
 * Response DTO for checkout operations
 */
export interface CheckoutResponseDTO {
  checkoutId: string;
  checkoutUrl: string;
  amount: number;
  description: string;
  status: string;
  expiresAt?: Date;
}
