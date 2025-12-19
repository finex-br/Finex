import { Injectable } from '@nestjs/common';
import { IPaymentProvider, AsaasCheckoutResponse } from '../../domain/ports/payment-provider.interface';
import axios, { AxiosInstance } from 'axios';

interface HttpClient {
  post(url: string, data: any, config?: any): Promise<any>;
  get(url: string, config?: any): Promise<any>;
}

/**
 * Asaas Payment Provider Implementation
 * Integrates with Asaas API for payment processing
 */
@Injectable()
export class AsaasPaymentProvider implements IPaymentProvider {
  private readonly baseUrl: string;
  private readonly httpClient: HttpClient;

  constructor(
    private readonly apiKey: string,
    baseUrl?: string,
  ) {
    this.baseUrl = baseUrl || 'https://api.asaas.com/v3';
    
    // Create axios instance with auth
    const axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'access_token': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    this.httpClient = {
      post: (url: string, data: any, config?: any) => axiosInstance.post(url, data, config),
      get: (url: string, config?: any) => axiosInstance.get(url, config),
    };
  }

  async createCheckout(data: {
    amount: number;
    description: string;
    customerName: string;
    customerEmail: string;
    customerCpfCnpj: string;
    maxInstallments?: number;
    minutesToExpire?: number;
    successUrl?: string;
    cancelUrl?: string;
  }): Promise<AsaasCheckoutResponse> {
    try {
      const payload = {
        billingTypes: ['CREDIT_CARD'],
        chargeTypes: data.maxInstallments && data.maxInstallments > 1 
          ? ['INSTALLMENT'] 
          : ['DETACHED'],
        minutesToExpire: data.minutesToExpire || 60,
        callback: {
          successUrl: data.successUrl || `${process.env.FRONTEND_URL}/payment/success`,
          cancelUrl: data.cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`,
          expiredUrl: data.cancelUrl || `${process.env.FRONTEND_URL}/payment/expired`,
        },
        items: [
          {
            name: data.description,
            description: data.description,
            quantity: 1,
            value: data.amount,
          },
        ],
        customerData: {
          name: data.customerName,
          cpfCnpj: data.customerCpfCnpj,
          email: data.customerEmail,
        },
      };

      // Add installment config if applicable
      if (data.maxInstallments && data.maxInstallments > 1) {
        (payload as any).installment = {
          maxInstallmentCount: data.maxInstallments,
        };
      }

      const response = await this.httpClient.post('/checkouts', payload);

      return {
        id: response.data.id,
        url: response.data.url,
        expirationDate: response.data.expirationDate,
      };
    } catch (error: any) {
      throw new Error(
        `Asaas API Error: ${error.response?.data?.errors?.[0]?.description || error.message}`,
      );
    }
  }

  async getCheckoutStatus(checkoutId: string): Promise<{
    status: string;
    paymentId?: string;
  }> {
    try {
      const response = await this.httpClient.get(`/checkouts/${checkoutId}`);

      return {
        status: response.data.status,
        paymentId: response.data.paymentId,
      };
    } catch (error: any) {
      throw new Error(
        `Asaas API Error: ${error.response?.data?.errors?.[0]?.description || error.message}`,
      );
    }
  }
}
