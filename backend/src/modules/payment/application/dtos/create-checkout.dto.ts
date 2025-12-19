/**
 * DTO for creating a new checkout
 */
export interface CreateCheckoutDTO {
  userId: string;
  amount: number;
  description: string;
  customerName: string;
  customerEmail: string;
  customerCpfCnpj: string;
  maxInstallments?: number;
  minutesToExpire?: number;
  successUrl?: string;
  cancelUrl?: string;
}
