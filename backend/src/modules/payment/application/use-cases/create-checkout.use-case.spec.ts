import { CreateCheckoutUseCase } from './create-checkout.use-case';
import { ICheckoutRepository } from '../../domain/ports/checkout-repository.interface';
import { IPaymentProvider } from '../../domain/ports/payment-provider.interface';
import { Checkout } from '../../domain/entities/checkout';

describe('CreateCheckoutUseCase', () => {
  let useCase: CreateCheckoutUseCase;
  let checkoutRepository: jest.Mocked<ICheckoutRepository>;
  let paymentProvider: jest.Mocked<IPaymentProvider>;

  beforeEach(() => {
    checkoutRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByAsaasCheckoutId: jest.fn(),
      delete: jest.fn(),
    };

    paymentProvider = {
      createCheckout: jest.fn(),
      getCheckoutStatus: jest.fn(),
    };

    useCase = new CreateCheckoutUseCase(checkoutRepository, paymentProvider);
  });

  it('should create a checkout successfully', async () => {
    const request = {
      userId: 'user-123',
      amount: 100.50,
      description: 'Premium Plan',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerCpfCnpj: '12345678909',
    };

    paymentProvider.createCheckout.mockResolvedValue({
      id: 'asaas-checkout-123',
      url: 'https://checkout.asaas.com/123',
      expirationDate: new Date(Date.now() + 3600000).toISOString(),
    });

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    const response = result.getValue();
    expect(response.checkoutUrl).toBe('https://checkout.asaas.com/123');
    expect(response.amount).toBe(100.50);
    expect(response.status).toBe('PENDING');
    expect(checkoutRepository.save).toHaveBeenCalled();
  });

  it('should fail with invalid amount', async () => {
    const request = {
      userId: 'user-123',
      amount: -10,
      description: 'Premium Plan',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerCpfCnpj: '12345678909',
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('cannot be negative');
    expect(checkoutRepository.save).not.toHaveBeenCalled();
  });

  it('should fail with empty description', async () => {
    const request = {
      userId: 'user-123',
      amount: 100,
      description: '',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerCpfCnpj: '12345678909',
    };

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Description is required');
  });

  it('should create checkout with installments', async () => {
    const request = {
      userId: 'user-123',
      amount: 600,
      description: 'Premium Plan',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerCpfCnpj: '12345678909',
      maxInstallments: 6,
    };

    paymentProvider.createCheckout.mockResolvedValue({
      id: 'asaas-checkout-456',
      url: 'https://checkout.asaas.com/456',
    });

    const result = await useCase.execute(request);

    expect(result.isSuccess).toBe(true);
    expect(paymentProvider.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        maxInstallments: 6,
      }),
    );
  });

  it('should handle payment provider errors', async () => {
    const request = {
      userId: 'user-123',
      amount: 100,
      description: 'Premium Plan',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerCpfCnpj: '12345678909',
    };

    paymentProvider.createCheckout.mockRejectedValue(new Error('API Error'));

    const result = await useCase.execute(request);

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Failed to create checkout');
    expect(checkoutRepository.save).not.toHaveBeenCalled();
  });
});
