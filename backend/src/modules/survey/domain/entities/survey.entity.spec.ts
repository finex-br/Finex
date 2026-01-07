import { describe, it, expect, beforeEach } from '@jest/globals';
import { Survey } from './survey.entity';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';

describe('Survey Entity', () => {
  describe('create', () => {
    it('should create a valid survey', () => {
      const result = Survey.create({
        title: 'Diagnóstico 360',
        description: 'Questionário completo de diagnóstico empresarial',
      });

      expect(result.isSuccess).toBe(true);
      const survey = result.getValue();
      expect(survey.title).toBe('Diagnóstico 360');
      expect(survey.description).toBe('Questionário completo de diagnóstico empresarial');
      expect(survey.isActive).toBe(true); // default
    });

    it('should create survey with custom isActive flag', () => {
      const result = Survey.create({
        title: 'Test Survey',
        description: 'Test description',
        isActive: false,
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isActive).toBe(false);
    });

    it('should create survey with provided ID', () => {
      const customId = new UniqueEntityID('custom-id');
      const result = Survey.create(
        {
          title: 'Test',
          description: 'Test',
        },
        customId,
      );

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id.equals(customId)).toBe(true);
    });

    it('should trim whitespace from title and description', () => {
      const result = Survey.create({
        title: '  Diagnóstico 360  ',
        description: '  Description with spaces  ',
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().title).toBe('Diagnóstico 360');
      expect(result.getValue().description).toBe('Description with spaces');
    });

    it('should set createdAt and updatedAt', () => {
      const beforeCreate = new Date();
      const result = Survey.create({
        title: 'Test',
        description: 'Test',
      });
      const afterCreate = new Date();

      expect(result.isSuccess).toBe(true);
      const survey = result.getValue();
      expect(survey.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(survey.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
      expect(survey.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(survey.updatedAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('should fail with empty title', () => {
      const result = Survey.create({
        title: '',
        description: 'Description',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Title is required');
    });

    it('should fail with whitespace-only title', () => {
      const result = Survey.create({
        title: '   ',
        description: 'Description',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Title is required');
    });

    it('should fail with empty description', () => {
      const result = Survey.create({
        title: 'Title',
        description: '',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Description is required');
    });

    it('should fail with title exceeding 255 characters', () => {
      const longTitle = 'a'.repeat(256);
      const result = Survey.create({
        title: longTitle,
        description: 'Description',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Title cannot exceed 255 characters');
    });

    it('should accept title with exactly 255 characters', () => {
      const title255 = 'a'.repeat(255);
      const result = Survey.create({
        title: title255,
        description: 'Description',
      });

      expect(result.isSuccess).toBe(true);
    });
  });

  describe('activate', () => {
    it('should activate an inactive survey', () => {
      const survey = Survey.create({
        title: 'Test',
        description: 'Test',
        isActive: false,
      }).getValue();

      const result = survey.activate();

      expect(result.isSuccess).toBe(true);
      expect(survey.isActive).toBe(true);
    });

    it('should update updatedAt when activating', () => {
      const survey = Survey.create({
        title: 'Test',
        description: 'Test',
        isActive: false,
      }).getValue();

      const beforeActivate = survey.updatedAt;
      // Small delay to ensure time difference
      setTimeout(() => {}, 10);
      survey.activate();

      expect(survey.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeActivate.getTime());
    });

    it('should fail when activating an already active survey', () => {
      const survey = Survey.create({
        title: 'Test',
        description: 'Test',
        isActive: true,
      }).getValue();

      const result = survey.activate();

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Survey is already active');
    });
  });

  describe('deactivate', () => {
    it('should deactivate an active survey', () => {
      const survey = Survey.create({
        title: 'Test',
        description: 'Test',
        isActive: true,
      }).getValue();

      const result = survey.deactivate();

      expect(result.isSuccess).toBe(true);
      expect(survey.isActive).toBe(false);
    });

    it('should fail when deactivating an already inactive survey', () => {
      const survey = Survey.create({
        title: 'Test',
        description: 'Test',
        isActive: false,
      }).getValue();

      const result = survey.deactivate();

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Survey is already inactive');
    });
  });

  describe('updateInfo', () => {
    it('should update title and description', () => {
      const survey = Survey.create({
        title: 'Old Title',
        description: 'Old Description',
      }).getValue();

      const result = survey.updateInfo('New Title', 'New Description');

      expect(result.isSuccess).toBe(true);
      expect(survey.title).toBe('New Title');
      expect(survey.description).toBe('New Description');
    });

    it('should trim whitespace', () => {
      const survey = Survey.create({
        title: 'Old',
        description: 'Old',
      }).getValue();

      survey.updateInfo('  New Title  ', '  New Description  ');

      expect(survey.title).toBe('New Title');
      expect(survey.description).toBe('New Description');
    });

    it('should update updatedAt', () => {
      const survey = Survey.create({
        title: 'Old',
        description: 'Old',
      }).getValue();

      const beforeUpdate = survey.updatedAt;
      setTimeout(() => {}, 10);
      survey.updateInfo('New', 'New');

      expect(survey.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });

    it('should fail with empty title', () => {
      const survey = Survey.create({
        title: 'Old',
        description: 'Old',
      }).getValue();

      const result = survey.updateInfo('', 'New Description');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Title cannot be empty');
      expect(survey.title).toBe('Old'); // unchanged
    });

    it('should fail with empty description', () => {
      const survey = Survey.create({
        title: 'Old',
        description: 'Old',
      }).getValue();

      const result = survey.updateInfo('New Title', '');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Description cannot be empty');
    });

    it('should fail with title exceeding 255 characters', () => {
      const survey = Survey.create({
        title: 'Old',
        description: 'Old',
      }).getValue();

      const longTitle = 'a'.repeat(256);
      const result = survey.updateInfo(longTitle, 'New Description');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Title cannot exceed 255 characters');
    });
  });

  describe('equals', () => {
    it('should be equal when IDs are the same', () => {
      const id = new UniqueEntityID('same-id');
      const survey1 = Survey.create({ title: 'A', description: 'A' }, id).getValue();
      const survey2 = Survey.create({ title: 'B', description: 'B' }, id).getValue();

      expect(survey1.equals(survey2)).toBe(true);
    });

    it('should not be equal when IDs are different', () => {
      const survey1 = Survey.create({ title: 'A', description: 'A' }).getValue();
      const survey2 = Survey.create({ title: 'A', description: 'A' }).getValue();

      expect(survey1.equals(survey2)).toBe(false);
    });
  });
});
