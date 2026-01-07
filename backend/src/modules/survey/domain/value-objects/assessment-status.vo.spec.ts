import { describe, it, expect } from '@jest/globals';
import { AssessmentStatus, AssessmentStatusEnum } from './assessment-status.vo';

describe('AssessmentStatus', () => {
  describe('create', () => {
    it('should create a valid IN_PROGRESS status', () => {
      const result = AssessmentStatus.create('IN_PROGRESS');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(AssessmentStatusEnum.IN_PROGRESS);
    });

    it('should create status case-insensitively', () => {
      const result = AssessmentStatus.create('in_progress');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(AssessmentStatusEnum.IN_PROGRESS);
    });

    it('should create a valid COMPLETED status', () => {
      const result = AssessmentStatus.create('COMPLETED');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(AssessmentStatusEnum.COMPLETED);
    });

    it('should fail with empty string', () => {
      const result = AssessmentStatus.create('');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Assessment status cannot be empty');
    });

    it('should fail with invalid status', () => {
      const result = AssessmentStatus.create('INVALID');

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Invalid assessment status');
    });
  });

  describe('factory methods', () => {
    it('should create IN_PROGRESS status with inProgress()', () => {
      const status = AssessmentStatus.inProgress();

      expect(status.value).toBe(AssessmentStatusEnum.IN_PROGRESS);
      expect(status.isInProgress()).toBe(true);
    });

    it('should create COMPLETED status with completed()', () => {
      const status = AssessmentStatus.completed();

      expect(status.value).toBe(AssessmentStatusEnum.COMPLETED);
      expect(status.isCompleted()).toBe(true);
    });
  });

  describe('status checking methods', () => {
    it('should correctly identify IN_PROGRESS status', () => {
      const status = AssessmentStatus.inProgress();

      expect(status.isInProgress()).toBe(true);
      expect(status.isCompleted()).toBe(false);
    });

    it('should correctly identify COMPLETED status', () => {
      const status = AssessmentStatus.completed();

      expect(status.isCompleted()).toBe(true);
      expect(status.isInProgress()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should be equal when statuses are the same', () => {
      const status1 = AssessmentStatus.inProgress();
      const status2 = AssessmentStatus.create('IN_PROGRESS').getValue();

      expect(status1.equals(status2)).toBe(true);
    });

    it('should not be equal when statuses are different', () => {
      const status1 = AssessmentStatus.inProgress();
      const status2 = AssessmentStatus.completed();

      expect(status1.equals(status2)).toBe(false);
    });
  });
});
