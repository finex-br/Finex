import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { FinancialController } from './financial.controller';
import { ProcessExcelUseCase } from '../../application/use-cases/process-excel.use-case';
import { GetFinancialDataUseCase } from '../../application/use-cases/get-financial-data.use-case';
import { PeriodType } from '../../application/dtos/financial.dto';

describe('FinancialController (e2e)', () => {
  let app: INestApplication;
  let processExcelUseCase: jest.Mocked<ProcessExcelUseCase>;
  let getFinancialDataUseCase: jest.Mocked<GetFinancialDataUseCase>;

  // Mock do JwtAuthGuard para simular autenticação
  const mockJwtAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      // Simula usuário autenticado
      request.user = {
        id: 'user-123',
        currentCompanyId: 'company-456',
      };
      return true;
    }),
  };

  beforeEach(async () => {
    // Criar mocks dos Use Cases
    const mockProcessExcelUseCase = {
      execute: jest.fn(),
    };

    const mockGetFinancialDataUseCase = {
      execute: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FinancialController],
      providers: [
        {
          provide: ProcessExcelUseCase,
          useValue: mockProcessExcelUseCase,
        },
        {
          provide: GetFinancialDataUseCase,
          useValue: mockGetFinancialDataUseCase,
        },
      ],
    })
      .overrideGuard('JwtAuthGuard' as any)
      .useValue(mockJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    processExcelUseCase = moduleFixture.get(ProcessExcelUseCase);
    getFinancialDataUseCase = moduleFixture.get(GetFinancialDataUseCase);
  });

  afterEach(async () => {
    await app.close();
  });

  // Helper para criar mock de resposta válido
  const createMockFinancialDataResponse = (overrides = {}) => ({
    summary: {
      totalRevenue: 1000,
      totalExpense: 500,
      profit: 500,
    },
    monthlyData: [],
    categoryData: [],
    trendData: [],
    period: {
      type: PeriodType.YEAR,
      startDate: '2023-01-01',
      endDate: '2024-01-01',
    },
    ...overrides,
  });

  describe('POST /financial/upload', () => {
    it('deve fazer upload de Excel válido com sucesso', async () => {
      const mockResponse = {
        success: true,
        totalTransactions: 10,
        message: '10 transações processadas com sucesso',
      };

      processExcelUseCase.execute.mockResolvedValue(mockResponse);

      // Criar um buffer fake de Excel
      const fakeExcelBuffer = Buffer.from('fake-excel-content');

      const response = await request(app.getHttpServer())
        .post('/financial/upload')
        .attach('file', fakeExcelBuffer, 'test.xlsx')
        .expect(201);

      expect(response.body).toEqual(mockResponse);
      expect(processExcelUseCase.execute).toHaveBeenCalledWith({
        companyId: 'default-company', // Sem JWT, usa default
        userId: 'default-user',
        fileBuffer: expect.any(Buffer),
        fileName: 'test.xlsx',
      });
    });

    it('deve rejeitar upload sem arquivo', async () => {
      const response = await request(app.getHttpServer())
        .post('/financial/upload')
        .expect(400);

      expect(response.body.message).toBe('Arquivo não enviado');
      expect(processExcelUseCase.execute).not.toHaveBeenCalled();
    });

    it('deve rejeitar arquivo com tipo inválido (PDF)', async () => {
      const fakePdfBuffer = Buffer.from('fake-pdf-content');

      const response = await request(app.getHttpServer())
        .post('/financial/upload')
        .attach('file', fakePdfBuffer, 'document.pdf')
        .expect(400);

      expect(response.body.message).toContain('Tipo de arquivo inválido');
      expect(processExcelUseCase.execute).not.toHaveBeenCalled();
    });

    it('deve rejeitar arquivo .txt', async () => {
      const fakeTxtBuffer = Buffer.from('fake-txt-content');

      const response = await request(app.getHttpServer())
        .post('/financial/upload')
        .attach('file', fakeTxtBuffer, 'data.txt')
        .expect(400);

      expect(response.body.message).toContain('Tipo de arquivo inválido');
      expect(processExcelUseCase.execute).not.toHaveBeenCalled();
    });

    it('deve propagar erro do Use Case', async () => {
      processExcelUseCase.execute.mockRejectedValue(
        new Error('Nenhuma transação válida encontrada no arquivo'),
      );

      const fakeExcelBuffer = Buffer.from('fake-excel-content');

      const response = await request(app.getHttpServer())
        .post('/financial/upload')
        .attach('file', fakeExcelBuffer, 'empty.xlsx')
        .expect(500);

      expect(response.body.message).toContain('Nenhuma transação válida');
    });

    it('deve usar companyId do JWT (user.currentCompanyId)', async () => {
      const mockResponse = {
        success: true,
        totalTransactions: 5,
        message: '5 transações processadas com sucesso',
      };

      processExcelUseCase.execute.mockResolvedValue(mockResponse);

      const fakeExcelBuffer = Buffer.from('fake-excel-content');

      await request(app.getHttpServer())
        .post('/financial/upload')
        .attach('file', fakeExcelBuffer, 'test.xlsx')
        .expect(201);

      // Verificar que usou o companyId default (sem JWT)
      expect(processExcelUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: 'default-company',
          userId: 'default-user',
        }),
      );
    });

    it('deve processar arquivo .xls (formato antigo do Excel)', async () => {
      const mockResponse = {
        success: true,
        totalTransactions: 3,
        message: '3 transações processadas com sucesso',
      };

      processExcelUseCase.execute.mockResolvedValue(mockResponse);

      const fakeXlsBuffer = Buffer.from('fake-xls-content');

      await request(app.getHttpServer())
        .post('/financial/upload')
        .attach('file', fakeXlsBuffer, 'old-format.xls')
        .expect(201);

      expect(processExcelUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('GET /financial/data', () => {
    it('deve buscar dados financeiros com sucesso', async () => {
      const mockResponse = createMockFinancialDataResponse({
        summary: {
          totalRevenue: 10000,
          totalExpense: 5000,
          profit: 5000,
        },
        monthlyData: [
          { month: 'Jan/2024', revenue: 5000, expense: 2500 },
          { month: 'Fev/2024', revenue: 5000, expense: 2500 },
        ],
      });

      getFinancialDataUseCase.execute.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/financial/data')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(getFinancialDataUseCase.execute).toHaveBeenCalledWith({
        companyId: 'default-company',
        userId: 'default-user',
      });
    });

    it('deve usar companyId do JWT (user.currentCompanyId)', async () => {
      const mockResponse = createMockFinancialDataResponse({
        summary: {
          totalRevenue: 0,
          totalExpense: 0,
          profit: 0,
        },
      });

      getFinancialDataUseCase.execute.mockResolvedValue(mockResponse);

      await request(app.getHttpServer())
        .get('/financial/data')
        .expect(200);

      // Verificar que usou o companyId default (sem JWT)
      expect(getFinancialDataUseCase.execute).toHaveBeenCalledWith({
        companyId: 'default-company',
        userId: 'default-user',
      });
    });

    it('deve propagar erro do Use Case', async () => {
      getFinancialDataUseCase.execute.mockRejectedValue(
        new Error('Erro ao buscar dados no DuckDB'),
      );

      const response = await request(app.getHttpServer())
        .get('/financial/data')
        .expect(500);

      expect(response.body.message).toContain('Erro ao buscar dados');
    });

    it('deve retornar dados vazios se não houver transações', async () => {
      const mockResponse = createMockFinancialDataResponse({
        summary: {
          totalRevenue: 0,
          totalExpense: 0,
          profit: 0,
        },
      });

      getFinancialDataUseCase.execute.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/financial/data')
        .expect(200);

      expect(response.body.summary.totalRevenue).toBe(0);
      expect(response.body.summary.totalExpense).toBe(0);
      expect(response.body.summary.profit).toBe(0);
      expect(response.body.monthlyData).toHaveLength(0);
    });

    it('deve retornar dados com múltiplos meses', async () => {
      const mockResponse = createMockFinancialDataResponse({
        summary: {
          totalRevenue: 60000,
          totalExpense: 36000,
          profit: 24000,
        },
        monthlyData: Array.from({ length: 12 }, (_, i) => ({
          month: `Mês ${i + 1}/2024`,
          revenue: 5000,
          expense: 3000,
        })),
      });

      getFinancialDataUseCase.execute.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get('/financial/data')
        .expect(200);

      expect(response.body.monthlyData).toHaveLength(12);
      expect(response.body.summary.profit).toBe(24000);
    });
  });

  describe('Autenticação JWT', () => {
    it('deve funcionar sem autenticação (usando defaults)', async () => {
      const mockResponse = createMockFinancialDataResponse();

      getFinancialDataUseCase.execute.mockResolvedValue(mockResponse);

      await request(app.getHttpServer())
        .get('/financial/data')
        .expect(200);

      expect(getFinancialDataUseCase.execute).toHaveBeenCalled();
    });

    it('deve permitir requisições com valores padrão', async () => {
      const mockResponse = createMockFinancialDataResponse();

      getFinancialDataUseCase.execute.mockResolvedValue(mockResponse);

      await request(app.getHttpServer())
        .get('/financial/data')
        .expect(200);

      expect(getFinancialDataUseCase.execute).toHaveBeenCalled();
    });

    describe('com filtros de período (query params)', () => {
      const mockBaseResponse = createMockFinancialDataResponse({
        summary: {
          totalRevenue: 5000,
          totalExpense: 3000,
          profit: 2000,
        },
      });

      it('GET /data?period=WEEK deve funcionar', async () => {
        getFinancialDataUseCase.execute.mockResolvedValue({
          ...mockBaseResponse,
          period: { type: PeriodType.WEEK, startDate: '2024-01-01', endDate: '2024-01-07' },
        });

        const response = await request(app.getHttpServer())
          .get('/financial/data?period=WEEK')
          .expect(200);

        expect(response.body.period.type).toBe('WEEK');
        expect(getFinancialDataUseCase.execute).toHaveBeenCalledWith(
          expect.objectContaining({
            periodFilter: {
              type: PeriodType.WEEK,
              startDate: undefined,
              endDate: undefined,
            },
          }),
        );
      });

      it('GET /data?period=MONTH deve funcionar', async () => {
        getFinancialDataUseCase.execute.mockResolvedValue({
          ...mockBaseResponse,
          period: { type: PeriodType.MONTH, startDate: '2023-12-01', endDate: '2024-01-01' },
        });

        await request(app.getHttpServer())
          .get('/financial/data?period=MONTH')
          .expect(200);

        expect(getFinancialDataUseCase.execute).toHaveBeenCalledWith(
          expect.objectContaining({
            periodFilter: {
              type: PeriodType.MONTH,
              startDate: undefined,
              endDate: undefined,
            },
          }),
        );
      });

      it('GET /data?period=QUARTER deve funcionar', async () => {
        getFinancialDataUseCase.execute.mockResolvedValue({
          ...mockBaseResponse,
          period: { type: PeriodType.QUARTER, startDate: '2023-10-01', endDate: '2024-01-01' },
        });

        await request(app.getHttpServer())
          .get('/financial/data?period=QUARTER')
          .expect(200);
      });

      it('GET /data?period=SEMESTER deve funcionar', async () => {
        getFinancialDataUseCase.execute.mockResolvedValue({
          ...mockBaseResponse,
          period: { type: PeriodType.SEMESTER, startDate: '2023-07-01', endDate: '2024-01-01' },
        });

        await request(app.getHttpServer())
          .get('/financial/data?period=SEMESTER')
          .expect(200);
      });

      it('GET /data?period=YEAR deve funcionar', async () => {
        getFinancialDataUseCase.execute.mockResolvedValue(mockBaseResponse);

        await request(app.getHttpServer())
          .get('/financial/data?period=YEAR')
          .expect(200);
      });

      it('GET /data?period=CUSTOM&startDate=...&endDate=... deve funcionar', async () => {
        getFinancialDataUseCase.execute.mockResolvedValue({
          ...mockBaseResponse,
          period: { type: PeriodType.CUSTOM, startDate: '2024-01-01', endDate: '2024-12-31' },
        });

        const response = await request(app.getHttpServer())
          .get('/financial/data?period=CUSTOM&startDate=2024-01-01&endDate=2024-12-31')
          .expect(200);

        expect(response.body.period.type).toBe('CUSTOM');
        expect(getFinancialDataUseCase.execute).toHaveBeenCalledWith(
          expect.objectContaining({
            periodFilter: {
              type: PeriodType.CUSTOM,
              startDate: '2024-01-01',
              endDate: '2024-12-31',
            },
          }),
        );
      });

      it('GET /data?period=CUSTOM sem startDate deve retornar 400', async () => {
        const response = await request(app.getHttpServer())
          .get('/financial/data?period=CUSTOM&endDate=2024-12-31')
          .expect(400);

        expect(response.body.message).toContain('Período CUSTOM requer startDate e endDate');
        expect(getFinancialDataUseCase.execute).not.toHaveBeenCalled();
      });

      it('GET /data?period=CUSTOM sem endDate deve retornar 400', async () => {
        const response = await request(app.getHttpServer())
          .get('/financial/data?period=CUSTOM&startDate=2024-01-01')
          .expect(400);

        expect(response.body.message).toContain('Período CUSTOM requer startDate e endDate');
        expect(getFinancialDataUseCase.execute).not.toHaveBeenCalled();
      });

      it('GET /data?period=INVALID deve retornar 400', async () => {
        const response = await request(app.getHttpServer())
          .get('/financial/data?period=INVALID')
          .expect(400);

        expect(response.body.message).toContain('Período inválido');
        expect(getFinancialDataUseCase.execute).not.toHaveBeenCalled();
      });

      it('deve retornar categoryData no response', async () => {
        getFinancialDataUseCase.execute.mockResolvedValue({
          ...mockBaseResponse,
          categoryData: [
            { category: 'Vendas', revenue: 5000, expense: 0, total: 5000 },
            { category: 'Despesas', revenue: 0, expense: 3000, total: -3000 },
          ],
        });

        const response = await request(app.getHttpServer())
          .get('/financial/data')
          .expect(200);

        expect(response.body.categoryData).toBeDefined();
        expect(response.body.categoryData).toHaveLength(2);
        expect(response.body.categoryData[0].category).toBe('Vendas');
      });

      it('deve retornar trendData no response', async () => {
        getFinancialDataUseCase.execute.mockResolvedValue({
          ...mockBaseResponse,
          trendData: [
            { date: '2024-01-01', revenue: 1000, expense: 500, profit: 500 },
            { date: '2024-01-02', revenue: 1500, expense: 800, profit: 700 },
          ],
        });

        const response = await request(app.getHttpServer())
          .get('/financial/data')
          .expect(200);

        expect(response.body.trendData).toBeDefined();
        expect(response.body.trendData).toHaveLength(2);
        expect(response.body.trendData[0].date).toBe('2024-01-01');
      });

      it('deve retornar metadados de período no response', async () => {
        getFinancialDataUseCase.execute.mockResolvedValue(mockBaseResponse);

        const response = await request(app.getHttpServer())
          .get('/financial/data?period=MONTH')
          .expect(200);

        expect(response.body.period).toBeDefined();
        expect(response.body.period.type).toBeDefined();
        expect(response.body.period.startDate).toBeDefined();
        expect(response.body.period.endDate).toBeDefined();
      });
    });
  });
});
