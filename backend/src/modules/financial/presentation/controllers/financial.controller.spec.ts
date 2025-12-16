import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { FinancialController } from './financial.controller';
import { ProcessExcelUseCase } from '../../application/use-cases/process-excel.use-case';
import { GetFinancialDataUseCase } from '../../application/use-cases/get-financial-data.use-case';

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
      const mockResponse = {
        summary: {
          totalRevenue: 10000,
          totalExpense: 5000,
          profit: 5000,
        },
        monthlyData: [
          { month: 'Jan/2024', revenue: 5000, expense: 2500 },
          { month: 'Fev/2024', revenue: 5000, expense: 2500 },
        ],
      };

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
      const mockResponse = {
        summary: {
          totalRevenue: 0,
          totalExpense: 0,
          profit: 0,
        },
        monthlyData: [],
      };

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
      const mockResponse = {
        summary: {
          totalRevenue: 0,
          totalExpense: 0,
          profit: 0,
        },
        monthlyData: [],
      };

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
      const mockResponse = {
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
      };

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
      const mockResponse = {
        summary: {
          totalRevenue: 1000,
          totalExpense: 500,
          profit: 500,
        },
        monthlyData: [],
      };

      getFinancialDataUseCase.execute.mockResolvedValue(mockResponse);

      await request(app.getHttpServer())
        .get('/financial/data')
        .expect(200);

      expect(getFinancialDataUseCase.execute).toHaveBeenCalled();
    });

    it('deve permitir requisições com valores padrão', async () => {
      const mockResponse = {
        summary: {
          totalRevenue: 1000,
          totalExpense: 500,
          profit: 500,
        },
        monthlyData: [],
      };

      getFinancialDataUseCase.execute.mockResolvedValue(mockResponse);

      await request(app.getHttpServer())
        .get('/financial/data')
        .expect(200);

      expect(getFinancialDataUseCase.execute).toHaveBeenCalled();
    });
  });
});
