import { describe, it, expect } from '@jest/globals';
import { CheckoutStatus, CheckoutStatusEnum } from './checkout-status';

describe('CheckoutStatus Value Object', () => {
  describe('create', () => {
    it('should create PENDING status', () => {
      const statusOrError = CheckoutStatus.create('PENDING');

      expect(statusOrError.isSuccess).toBe(true);
      expect(statusOrError.getValue().value).toBe('PENDING');
    });

    it('should create CONFIRMED status', () => {
      const statusOrError = CheckoutStatus.create('CONFIRMED');

      expect(statusOrError.isSuccess).toBe(true);
      expect(statusOrError.getValue().value).toBe('CONFIRMED');
    });

    it('should create RECEIVED status', () => {
      const statusOrError = CheckoutStatus.create('RECEIVED');

      expect(statusOrError.isSuccess).toBe(true);
      expect(statusOrError.getValue().value).toBe('RECEIVED');
    });

    it('should be case-insensitive', () => {
      const statusOrError = CheckoutStatus.create('pending');

      expect(statusOrError.isSuccess).toBe(true);
      expect(statusOrError.getValue().value).toBe('PENDING');
    });

    it('should fail with empty status', () => {
      const statusOrError = CheckoutStatus.create('');

      expect(statusOrError.isFailure).toBe(true);
      expect(statusOrError.error).toContain('required');
    });

    it('should fail with invalid status', () => {
      const statusOrError = CheckoutStatus.create('INVALID_STATUS');

      expect(statusOrError.isFailure).toBe(true);
      expect(statusOrError.error).toContain('Invalid checkout status');
    });
  });

  describe('helper methods', () => {
    it('should identify PENDING status', () => {
      const status = CheckoutStatus.create('PENDING').getValue();

      expect(status.isPending()).toBe(true);
      expect(status.isConfirmed()).toBe(false);
    });

    it('should identify CONFIRMED status', () => {
      const status = CheckoutStatus.create('CONFIRMED').getValue();

      expect(status.isConfirmed()).toBe(true);
      expect(status.isPending()).toBe(false);
    });

    it('should identify RECEIVED status', () => {
      const status = CheckoutStatus.create('RECEIVED').getValue();

      expect(status.isReceived()).toBe(true);
      expect(status.isPending()).toBe(false);
    });

    it('should allow cancellation for PENDING status', () => {
      const status = CheckoutStatus.create('PENDING').getValue();

      expect(status.canBeCancelled()).toBe(true);
    });

    it('should not allow cancellation for CONFIRMED status', () => {
      const status = CheckoutStatus.create('CONFIRMED').getValue();

      expect(status.canBeCancelled()).toBe(false);
    });

    it('should allow refund for CONFIRMED status', () => {
      const status = CheckoutStatus.create('CONFIRMED').getValue();

      expect(status.canBeRefunded()).toBe(true);
    });

    it('should not allow refund for PENDING status', () => {
      const status = CheckoutStatus.create('PENDING').getValue();

      expect(status.canBeRefunded()).toBe(false);
    });
  });
});
