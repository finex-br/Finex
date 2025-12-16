import { describe, it, expect } from '@jest/globals';
import { PeriodFilter } from './period-filter';

describe('PeriodFilter Value Object', () => {
  describe('Factory method - create', () => {
    describe('Períodos predefinidos (sem datas)', () => {
      it('deve criar período WEEK válido', () => {
        const result = PeriodFilter.create({ type: 'WEEK' });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().type).toBe('WEEK');
        expect(result.getValue().startDate).toBeUndefined();
        expect(result.getValue().endDate).toBeUndefined();
      });

      it('deve criar período MONTH válido', () => {
        const result = PeriodFilter.create({ type: 'MONTH' });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().type).toBe('MONTH');
      });

      it('deve criar período QUARTER válido', () => {
        const result = PeriodFilter.create({ type: 'QUARTER' });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().type).toBe('QUARTER');
      });

      it('deve criar período SEMESTER válido', () => {
        const result = PeriodFilter.create({ type: 'SEMESTER' });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().type).toBe('SEMESTER');
      });

      it('deve criar período YEAR válido', () => {
        const result = PeriodFilter.create({ type: 'YEAR' });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().type).toBe('YEAR');
      });
    });

    describe('Período CUSTOM (com datas)', () => {
      it('deve criar período CUSTOM com datas válidas', () => {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-12-31');

        const result = PeriodFilter.create({
          type: 'CUSTOM',
          startDate,
          endDate,
        });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().type).toBe('CUSTOM');
        expect(result.getValue().startDate).toBe(startDate);
        expect(result.getValue().endDate).toBe(endDate);
      });

      it('deve falhar ao criar CUSTOM sem startDate', () => {
        const endDate = new Date('2024-12-31');

        const result = PeriodFilter.create({
          type: 'CUSTOM',
          endDate,
        });

        expect(result.isFailure).toBe(true);
        expect(result.error).toBe('Período customizado requer startDate e endDate');
      });

      it('deve falhar ao criar CUSTOM sem endDate', () => {
        const startDate = new Date('2024-01-01');

        const result = PeriodFilter.create({
          type: 'CUSTOM',
          startDate,
        });

        expect(result.isFailure).toBe(true);
        expect(result.error).toBe('Período customizado requer startDate e endDate');
      });

      it('deve falhar ao criar CUSTOM com startDate > endDate', () => {
        const startDate = new Date('2024-12-31');
        const endDate = new Date('2024-01-01');

        const result = PeriodFilter.create({
          type: 'CUSTOM',
          startDate,
          endDate,
        });

        expect(result.isFailure).toBe(true);
        expect(result.error).toBe('startDate não pode ser maior que endDate');
      });
    });

    describe('Validações de datas em tipos predefinidos', () => {
      it('deve falhar ao criar WEEK com startDate', () => {
        const startDate = new Date('2024-01-01');

        const result = PeriodFilter.create({
          type: 'WEEK',
          startDate,
        });

        expect(result.isFailure).toBe(true);
        expect(result.error).toBe('Tipos predefinidos não devem ter startDate/endDate');
      });

      it('deve falhar ao criar MONTH com endDate', () => {
        const endDate = new Date('2024-12-31');

        const result = PeriodFilter.create({
          type: 'MONTH',
          endDate,
        });

        expect(result.isFailure).toBe(true);
        expect(result.error).toBe('Tipos predefinidos não devem ter startDate/endDate');
      });

      it('deve falhar ao criar YEAR com ambas as datas', () => {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-12-31');

        const result = PeriodFilter.create({
          type: 'YEAR',
          startDate,
          endDate,
        });

        expect(result.isFailure).toBe(true);
        expect(result.error).toBe('Tipos predefinidos não devem ter startDate/endDate');
      });
    });
  });

  describe('getDateRange', () => {
    describe('Períodos predefinidos', () => {
      it('deve calcular dateRange para WEEK (últimos 7 dias)', () => {
        const periodFilter = PeriodFilter.create({ type: 'WEEK' }).getValue();
        const { startDate, endDate } = periodFilter.getDateRange();

        const diffInDays = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        expect(diffInDays).toBe(7);
        expect(startDate).toBeInstanceOf(Date);
        expect(endDate).toBeInstanceOf(Date);
      });

      it('deve calcular dateRange para MONTH (último mês)', () => {
        const periodFilter = PeriodFilter.create({ type: 'MONTH' }).getValue();
        const { startDate, endDate } = periodFilter.getDateRange();

        // Verificar que a diferença é aproximadamente 30 dias (pode variar)
        const diffInDays = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        expect(diffInDays).toBeGreaterThanOrEqual(28); // Mês menor
        expect(diffInDays).toBeLessThanOrEqual(31);    // Mês maior
      });

      it('deve calcular dateRange para QUARTER (últimos 3 meses)', () => {
        const periodFilter = PeriodFilter.create({ type: 'QUARTER' }).getValue();
        const { startDate, endDate } = periodFilter.getDateRange();

        // Verificar que a diferença é aproximadamente 90 dias
        const diffInDays = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        expect(diffInDays).toBeGreaterThanOrEqual(89);  // 3 meses menores
        expect(diffInDays).toBeLessThanOrEqual(92);     // 3 meses maiores
      });

      it('deve calcular dateRange para SEMESTER (últimos 6 meses)', () => {
        const periodFilter = PeriodFilter.create({ type: 'SEMESTER' }).getValue();
        const { startDate, endDate } = periodFilter.getDateRange();

        // Verificar que a diferença é aproximadamente 180 dias
        const diffInDays = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        expect(diffInDays).toBeGreaterThanOrEqual(181); // 6 meses menores
        expect(diffInDays).toBeLessThanOrEqual(184);    // 6 meses maiores
      });

      it('deve calcular dateRange para YEAR (últimos 12 meses)', () => {
        const periodFilter = PeriodFilter.create({ type: 'YEAR' }).getValue();
        const { startDate, endDate } = periodFilter.getDateRange();

        // Verificar que a diferença é aproximadamente 365 dias
        const diffInDays = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        expect(diffInDays).toBeGreaterThanOrEqual(365); // Ano normal
        expect(diffInDays).toBeLessThanOrEqual(366);    // Ano bissexto
      });
    });

    describe('Período CUSTOM', () => {
      it('deve retornar as datas fornecidas para CUSTOM', () => {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-12-31');

        const periodFilter = PeriodFilter.create({
          type: 'CUSTOM',
          startDate,
          endDate,
        }).getValue();

        const dateRange = periodFilter.getDateRange();

        expect(dateRange.startDate).toBe(startDate);
        expect(dateRange.endDate).toBe(endDate);
      });
    });
  });
});
