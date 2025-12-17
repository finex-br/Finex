/**
 * Asaas Checkout Response from API
 */
export interface AsaasCheckoutResponse {
  id: string;
  url: string;
  expirationDate?: string;
}

/**
 * Payment Provider Port (Interface)
 * Defines the contract for payment gateway integration
 */
export interface IPaymentProvider {
  /**
   * Create a checkout session with the payment provider
   * @param data - Checkout creation data
   * @returns Checkout URL and ID
   */
  createCheckout(data: {
    amount: number;
    description: string;
    customerName: string;
    customerEmail: string;
    customerCpfCnpj: string;
    maxInstallments?: number;
    minutesToExpire?: number;
    successUrl?: string;
    cancelUrl?: string;
  }): Promise<AsaasCheckoutResponse>;

  /**
   * Get checkout status from payment provider
   * @param checkoutId - The checkout ID
   */
  getCheckoutStatus(checkoutId: string): Promise<{
    status: string;
    paymentId?: string;
  }>;
}
