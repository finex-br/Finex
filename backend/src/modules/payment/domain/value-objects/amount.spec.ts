import { describe, it, expect } from '@jest/globals';
import { Amount } from './amount';

describe('Amount Value Object', () => {
  describe('create', () => {
    it('should create a valid amount', () => {
      const amountOrError = Amount.create(100.50);

      expect(amountOrError.isSuccess).toBe(true);
      expect(amountOrError.getValue().value).toBe(100.50);
    });

    it('should create amount with rounding to 2 decimal places', () => {
      const amountOrError = Amount.create(100.999);

      expect(amountOrError.isSuccess).toBe(true);
      expect(amountOrError.getValue().value).toBe(101.00);
    });

    it('should fail with null amount', () => {
      const amountOrError = Amount.create(null as any);

      expect(amountOrError.isFailure).toBe(true);
      expect(amountOrError.error).toContain('Amount is required');
    });

    it('should fail with undefined amount', () => {
      const amountOrError = Amount.create(undefined as any);

      expect(amountOrError.isFailure).toBe(true);
      expect(amountOrError.error).toContain('Amount is required');
    });

    it('should fail with negative amount', () => {
      const amountOrError = Amount.create(-10);

      expect(amountOrError.isFailure).toBe(true);
      expect(amountOrError.error).toContain('cannot be negative');
    });

    it('should fail with zero amount', () => {
      const amountOrError = Amount.create(0);

      expect(amountOrError.isFailure).toBe(true);
      expect(amountOrError.error).toContain('greater than zero');
    });

    it('should fail with amount exceeding maximum', () => {
      const amountOrError = Amount.create(1000000);

      expect(amountOrError.isFailure).toBe(true);
      expect(amountOrError.error).toContain('exceeds maximum');
    });

    it('should accept maximum valid amount', () => {
      const amountOrError = Amount.create(999999.99);

      expect(amountOrError.isSuccess).toBe(true);
      expect(amountOrError.getValue().value).toBe(999999.99);
    });
  });

  describe('operations', () => {
    it('should add two amounts', () => {
      const amount1 = Amount.create(100).getValue();
      const amount2 = Amount.create(50).getValue();

      const result = amount1.add(amount2);

      expect(result.value).toBe(150);
    });

    it('should subtract amounts', () => {
      const amount1 = Amount.create(100).getValue();
      const amount2 = Amount.create(30).getValue();

      const result = amount1.subtract(amount2);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(70);
    });

    it('should fail subtraction resulting in negative', () => {
      const amount1 = Amount.create(50).getValue();
      const amount2 = Amount.create(100).getValue();

      const result = amount1.subtract(amount2);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('would be negative');
    });

    it('should multiply amount by factor', () => {
      const amount = Amount.create(100).getValue();

      const result = amount.multiply(1.5);

      expect(result.value).toBe(150);
    });

    it('should compare amounts with isGreaterThan', () => {
      const amount1 = Amount.create(100).getValue();
      const amount2 = Amount.create(50).getValue();

      expect(amount1.isGreaterThan(amount2)).toBe(true);
      expect(amount2.isGreaterThan(amount1)).toBe(false);
    });

    it('should compare amounts with isLessThan', () => {
      const amount1 = Amount.create(50).getValue();
      const amount2 = Amount.create(100).getValue();

      expect(amount1.isLessThan(amount2)).toBe(true);
      expect(amount2.isLessThan(amount1)).toBe(false);
    });

    it('should check equality', () => {
      const amount1 = Amount.create(100.00).getValue();
      const amount2 = Amount.create(100.00).getValue();
      const amount3 = Amount.create(100.01).getValue();

      expect(amount1.equals(amount2)).toBe(true);
      expect(amount1.equals(amount3)).toBe(false);
    });
  });
});
