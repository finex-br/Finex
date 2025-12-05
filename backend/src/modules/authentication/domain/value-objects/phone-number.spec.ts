import { PhoneNumber } from './phone-number';

describe('PhoneNumber Value Object', () => {
  describe('create', () => {
    it('should create a valid Brazilian phone number with country code', () => {
      const result = PhoneNumber.create('+5511987654321');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('+5511987654321');
    });

    it('should create a valid Brazilian phone number without country code', () => {
      const result = PhoneNumber.create('11987654321');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('+5511987654321');
    });

    it('should create a valid phone number with formatting', () => {
      const result = PhoneNumber.create('(11) 98765-4321');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('+5511987654321');
    });

    it('should fail when phone number is empty', () => {
      const result = PhoneNumber.create('');

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('required');
    });

    it('should fail when phone number is null or undefined', () => {
      const resultNull = PhoneNumber.create(null as any);
      const resultUndefined = PhoneNumber.create(undefined as any);

      expect(resultNull.isFailure).toBe(true);
      expect(resultUndefined.isFailure).toBe(true);
    });

    it('should fail when phone number has less than 10 digits', () => {
      const result = PhoneNumber.create('119876543'); // 9 digits

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('invalid');
    });

    it('should fail when phone number has more than 11 digits', () => {
      const result = PhoneNumber.create('119876543210'); // 12 digits

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('invalid');
    });

    it('should fail when phone number has invalid characters', () => {
      const result = PhoneNumber.create('11abcdefghi');

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('invalid');
    });

    it('should normalize phone number removing spaces and special chars', () => {
      const result = PhoneNumber.create('+55 (11) 9 8765-4321');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('+5511987654321');
    });

    it('should accept landline with 10 digits', () => {
      const result = PhoneNumber.create('1133334444');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('+551133334444');
    });

    it('should accept mobile with 11 digits (9 prefix)', () => {
      const result = PhoneNumber.create('11987654321');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('+5511987654321');
    });
  });

  describe('equals', () => {
    it('should return true for phone numbers with same value', () => {
      const phone1 = PhoneNumber.create('11987654321').getValue();
      const phone2 = PhoneNumber.create('+55 11 98765-4321').getValue();

      expect(phone1.equals(phone2)).toBe(true);
    });

    it('should return false for phone numbers with different values', () => {
      const phone1 = PhoneNumber.create('11987654321').getValue();
      const phone2 = PhoneNumber.create('11987654322').getValue();

      expect(phone1.equals(phone2)).toBe(false);
    });

    it('should return false when comparing with null or undefined', () => {
      const phone = PhoneNumber.create('11987654321').getValue();

      expect(phone.equals(null as any)).toBe(false);
      expect(phone.equals(undefined as any)).toBe(false);
    });
  });

  describe('getFormatted', () => {
    it('should format mobile number with 11 digits', () => {
      const phone = PhoneNumber.create('11987654321').getValue();

      expect(phone.getFormatted()).toBe('(11) 98765-4321');
    });

    it('should format landline with 10 digits', () => {
      const phone = PhoneNumber.create('1133334444').getValue();

      expect(phone.getFormatted()).toBe('(11) 3333-4444');
    });
  });
});
