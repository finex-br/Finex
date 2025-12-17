import { Checkout } from './checkout';
import { Amount } from '../value-objects/amount';
import { CheckoutStatus } from '../value-objects/checkout-status';

describe('Checkout Entity', () => {
  describe('create', () => {
    it('should create a valid checkout', () => {
      const amount = Amount.create(100).getValue();
      const status = CheckoutStatus.create('PENDING').getValue();

      const checkoutOrError = Checkout.create({
        userId: 'user-123',
        amount,
        description: 'Premium Plan Subscription',
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(checkoutOrError.isSuccess).toBe(true);
      const checkout = checkoutOrError.getValue();
      expect(checkout.userId).toBe('user-123');
      expect(checkout.amount.value).toBe(100);
      expect(checkout.description).toBe('Premium Plan Subscription');
    });

    it('should fail without user ID', () => {
      const amount = Amount.create(100).getValue();
      const status = CheckoutStatus.create('PENDING').getValue();

      const checkoutOrError = Checkout.create({
        userId: '',
        amount,
        description: 'Test',
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(checkoutOrError.isFailure).toBe(true);
      expect(checkoutOrError.error).toContain('User ID is required');
    });

    it('should fail without amount', () => {
      const status = CheckoutStatus.create('PENDING').getValue();

      const checkoutOrError = Checkout.create({
        userId: 'user-123',
        amount: null as any,
        description: 'Test',
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(checkoutOrError.isFailure).toBe(true);
      expect(checkoutOrError.error).toContain('Amount is required');
    });

    it('should fail with empty description', () => {
      const amount = Amount.create(100).getValue();
      const status = CheckoutStatus.create('PENDING').getValue();

      const checkoutOrError = Checkout.create({
        userId: 'user-123',
        amount,
        description: '',
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(checkoutOrError.isFailure).toBe(true);
      expect(checkoutOrError.error).toContain('Description is required');
    });

    it('should fail with description too long', () => {
      const amount = Amount.create(100).getValue();
      const status = CheckoutStatus.create('PENDING').getValue();

      const checkoutOrError = Checkout.create({
        userId: 'user-123',
        amount,
        description: 'a'.repeat(501),
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(checkoutOrError.isFailure).toBe(true);
      expect(checkoutOrError.error).toContain('less than 500 characters');
    });

    it('should accept max installments', () => {
      const amount = Amount.create(600).getValue();
      const status = CheckoutStatus.create('PENDING').getValue();

      const checkoutOrError = Checkout.create({
        userId: 'user-123',
        amount,
        description: 'Parcelado',
        status,
        maxInstallments: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(checkoutOrError.isSuccess).toBe(true);
      expect(checkoutOrError.getValue().maxInstallments).toBe(6);
    });

    it('should fail with invalid max installments', () => {
      const amount = Amount.create(100).getValue();
      const status = CheckoutStatus.create('PENDING').getValue();

      const checkoutOrError = Checkout.create({
        userId: 'user-123',
        amount,
        description: 'Test',
        status,
        maxInstallments: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(checkoutOrError.isFailure).toBe(true);
      expect(checkoutOrError.error).toContain('between 1 and 12');
    });
  });

  describe('confirm', () => {
    it('should confirm a pending checkout', () => {
      const amount = Amount.create(100).getValue();
      const status = CheckoutStatus.create('PENDING').getValue();
      const checkout = Checkout.create({
        userId: 'user-123',
        amount,
        description: 'Test',
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getValue();

      const result = checkout.confirm('asaas-payment-123');

      expect(result.isSuccess).toBe(true);
      expect(checkout.status.isConfirmed()).toBe(true);
      expect(checkout.asaasPaymentId).toBe('asaas-payment-123');
      expect(checkout.paidAt).toBeDefined();
    });

    it('should fail to confirm non-pending checkout', () => {
      const amount = Amount.create(100).getValue();
      const status = CheckoutStatus.create('CONFIRMED').getValue();
      const checkout = Checkout.create({
        userId: 'user-123',
        amount,
        description: 'Test',
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getValue();

      const result = checkout.confirm('asaas-payment-123');

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('only confirm pending');
    });
  });

  describe('cancel', () => {
    it('should cancel a pending checkout', () => {
      const amount = Amount.create(100).getValue();
      const status = CheckoutStatus.create('PENDING').getValue();
      const checkout = Checkout.create({
        userId: 'user-123',
        amount,
        description: 'Test',
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getValue();

      const result = checkout.cancel();

      expect(result.isSuccess).toBe(true);
      expect(checkout.status.isCancelled()).toBe(true);
    });

    it('should fail to cancel confirmed checkout', () => {
      const amount = Amount.create(100).getValue();
      const status = CheckoutStatus.create('CONFIRMED').getValue();
      const checkout = Checkout.create({
        userId: 'user-123',
        amount,
        description: 'Test',
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getValue();

      const result = checkout.cancel();

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Cannot cancel');
    });
  });

  describe('setAsaasCheckoutId', () => {
    it('should set Asaas checkout ID and URL', () => {
      const amount = Amount.create(100).getValue();
      const status = CheckoutStatus.create('PENDING').getValue();
      const checkout = Checkout.create({
        userId: 'user-123',
        amount,
        description: 'Test',
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).getValue();

      checkout.setAsaasCheckoutId('asaas-checkout-123', 'https://checkout.asaas.com/123');

      expect(checkout.asaasCheckoutId).toBe('asaas-checkout-123');
      expect(checkout.checkoutUrl).toBe('https://checkout.asaas.com/123');
    });
  });
});
