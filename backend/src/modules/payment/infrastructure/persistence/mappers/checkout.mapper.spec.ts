import { describe, it, expect } from '@jest/globals';
import { CheckoutMapper } from './checkout.mapper';
import { Checkout } from '../../../domain/entities/checkout';
import { CheckoutSchema } from '../typeorm/schemas/checkout.schema';
import { Amount } from '../../../domain/value-objects/amount';
import { CheckoutStatus } from '../../../domain/value-objects/checkout-status';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';

describe('CheckoutMapper', () => {
  describe('toDomain', () => {
    it('should map schema to domain entity', () => {
      const schema = new CheckoutSchema();
      schema.id = '123e4567-e89b-12d3-a456-426614174000';
      schema.userId = 'user-123';
      schema.amount = 99.99;
      schema.description = 'Test checkout';
      schema.status = 'PENDING';
      schema.asaasCheckoutId = 'cko_123';
      schema.checkoutUrl = 'https://asaas.com/checkout/cko_123';
      schema.createdAt = new Date('2024-01-01');
      schema.updatedAt = new Date('2024-01-01');

      const checkout = CheckoutMapper.toDomain(schema);

      expect(checkout).toBeInstanceOf(Checkout);
      expect(checkout.id.toString()).toBe(schema.id);
      expect(checkout.userId).toBe(schema.userId);
      expect(checkout.amount.value).toBe(schema.amount);
      expect(checkout.description).toBe(schema.description);
      expect(checkout.status.value).toBe('PENDING');
    });

    it('should throw error when amount is invalid', () => {
      const schema = new CheckoutSchema();
      schema.id = '123e4567-e89b-12d3-a456-426614174000';
      schema.userId = 'user-123';
      schema.amount = -10; // Invalid
      schema.description = 'Test';
      schema.status = 'PENDING';
      schema.createdAt = new Date();
      schema.updatedAt = new Date();

      expect(() => CheckoutMapper.toDomain(schema)).toThrow('Invalid checkout data from database');
    });

    it('should throw error when status is invalid', () => {
      const schema = new CheckoutSchema();
      schema.id = '123e4567-e89b-12d3-a456-426614174000';
      schema.userId = 'user-123';
      schema.amount = 99.99;
      schema.description = 'Test';
      schema.status = 'invalid-status'; // Invalid
      schema.createdAt = new Date();
      schema.updatedAt = new Date();

      expect(() => CheckoutMapper.toDomain(schema)).toThrow('Invalid checkout data from database');
    });
  });

  describe('toPersistence', () => {
    it('should map domain entity to schema', () => {
      const amount = Amount.create(99.99).getValue();
      const status = CheckoutStatus.create('PENDING').getValue();
      
      const checkoutOrError = Checkout.create({
        userId: 'user-123',
        amount,
        description: 'Test checkout',
        status,
        asaasCheckoutId: 'cko_123',
        checkoutUrl: 'https://asaas.com/checkout/cko_123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }, new UniqueEntityID('123e4567-e89b-12d3-a456-426614174000'));

      const checkout = checkoutOrError.getValue();
      const schema = CheckoutMapper.toPersistence(checkout);

      expect(schema).toBeInstanceOf(CheckoutSchema);
      expect(schema.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(schema.userId).toBe('user-123');
      expect(schema.amount).toBe(99.99);
      expect(schema.description).toBe('Test checkout');
      expect(schema.status).toBe('PENDING');
      expect(schema.asaasCheckoutId).toBe('cko_123');
    });

    it('should map all optional fields', () => {
      const amount = Amount.create(199.99).getValue();
      const status = CheckoutStatus.create('RECEIVED').getValue();
      
      const paidAt = new Date('2024-01-02');
      const expiresAt = new Date('2024-01-31');

      const checkoutOrError = Checkout.create({
        userId: 'user-456',
        amount,
        description: 'Premium plan',
        status,
        asaasCheckoutId: 'cko_456',
        asaasPaymentId: 'pay_123',
        checkoutUrl: 'https://asaas.com/checkout/cko_456',
        maxInstallments: 12,
        paidAt,
        expiresAt,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      });

      const checkout = checkoutOrError.getValue();
      const schema = CheckoutMapper.toPersistence(checkout);

      expect(schema.asaasPaymentId).toBe('pay_123');
      expect(schema.maxInstallments).toBe(12);
      expect(schema.paidAt).toBe(paidAt);
      expect(schema.expiresAt).toBe(expiresAt);
    });
  });
});
