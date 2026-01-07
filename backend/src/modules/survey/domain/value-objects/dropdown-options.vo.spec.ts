import { describe, it, expect } from '@jest/globals';
import { DropdownOptions } from './dropdown-options.vo';

describe('DropdownOptions', () => {
  describe('create', () => {
    it('should create valid dropdown options', () => {
      const result = DropdownOptions.create(['Option 1', 'Option 2', 'Option 3']);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().options).toEqual(['Option 1', 'Option 2', 'Option 3']);
    });

    it('should trim whitespace from options', () => {
      const result = DropdownOptions.create(['  Option 1  ', 'Option 2   ', '  Option 3']);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().options).toEqual(['Option 1', 'Option 2', 'Option 3']);
    });

    it('should filter out empty strings', () => {
      const result = DropdownOptions.create(['Option 1', '', 'Option 2', '   ']);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().options).toEqual(['Option 1', 'Option 2']);
    });

    it('should fail with null or undefined', () => {
      const result1 = DropdownOptions.create(null as any);
      const result2 = DropdownOptions.create(undefined as any);

      expect(result1.isFailure).toBe(true);
      expect(result2.isFailure).toBe(true);
      expect(result1.error).toBe('Options must be an array');
    });

    it('should fail with empty array', () => {
      const result = DropdownOptions.create([]);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Dropdown must have at least one option');
    });

    it('should fail when all options are empty after cleaning', () => {
      const result = DropdownOptions.create(['', '   ', '\t']);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Dropdown must have at least one non-empty option');
    });

    it('should fail with duplicate options', () => {
      const result = DropdownOptions.create(['Option 1', 'Option 2', 'Option 1']);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Dropdown options must be unique');
    });

    it('should fail with duplicate options after trimming', () => {
      const result = DropdownOptions.create(['Option 1', '  Option 1  ']);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Dropdown options must be unique');
    });

    it('should accept single option', () => {
      const result = DropdownOptions.create(['Only Option']);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().options).toEqual(['Only Option']);
    });
  });

  describe('contains', () => {
    it('should return true for existing option', () => {
      const options = DropdownOptions.create(['Option 1', 'Option 2']).getValue();

      expect(options.contains('Option 1')).toBe(true);
      expect(options.contains('Option 2')).toBe(true);
    });

    it('should return false for non-existing option', () => {
      const options = DropdownOptions.create(['Option 1', 'Option 2']).getValue();

      expect(options.contains('Option 3')).toBe(false);
    });

    it('should be case-sensitive', () => {
      const options = DropdownOptions.create(['Option 1']).getValue();

      expect(options.contains('option 1')).toBe(false);
    });
  });

  describe('size', () => {
    it('should return correct number of options', () => {
      const options = DropdownOptions.create(['Option 1', 'Option 2', 'Option 3']).getValue();

      expect(options.size()).toBe(3);
    });
  });

  describe('equals', () => {
    it('should be equal when options are the same', () => {
      const options1 = DropdownOptions.create(['A', 'B', 'C']).getValue();
      const options2 = DropdownOptions.create(['A', 'B', 'C']).getValue();

      expect(options1.equals(options2)).toBe(true);
    });

    it('should not be equal when options are different', () => {
      const options1 = DropdownOptions.create(['A', 'B']).getValue();
      const options2 = DropdownOptions.create(['A', 'C']).getValue();

      expect(options1.equals(options2)).toBe(false);
    });

    it('should not be equal when order is different', () => {
      const options1 = DropdownOptions.create(['A', 'B']).getValue();
      const options2 = DropdownOptions.create(['B', 'A']).getValue();

      expect(options1.equals(options2)).toBe(false);
    });
  });
});
