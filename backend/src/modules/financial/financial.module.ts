import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { FinancialController } from './presentation/controllers/financial.controller';
import { PendingDocumentController } from './presentation/controllers/pending-document.controller';
import { ProcessExcelUseCase } from './application/use-cases/process-excel.use-case';
import { GetFinancialDataUseCase } from './application/use-cases/get-financial-data.use-case';
import { UploadRawDocumentUseCase } from './application/use-cases/upload-raw-document.use-case';
import { MapDocumentColumnsUseCase } from './application/use-cases/map-document-columns.use-case';
import { ValidateDocumentUseCase } from './application/use-cases/validate-document.use-case';
import { ApproveDocumentUseCase } from './application/use-cases/approve-document.use-case';
import { GetPendingDocumentsUseCase } from './application/use-cases/get-pending-documents.use-case';
import { ExcelProcessorAdapter } from './infrastructure/adapters/excel-processor.adapter';
import { ExcelAnalyzerAdapter } from './infrastructure/adapters/excel-analyzer.adapter';
import { TypeORMFinancialRepository } from './infrastructure/persistence/typeorm/typeorm-financial.repository';
import { TypeORMFinancialUploadRepository } from './infrastructure/persistence/typeorm/typeorm-financial-upload.repository';
import { FinancialTransactionSchema } from './infrastructure/persistence/typeorm/financial-transaction.schema';
import { FinancialUploadSchema } from './infrastructure/persistence/typeorm/financial-upload.schema';
import { EnvService } from '../../shared/infra/env/env.service';

/**
 * FinancialModule - Módulo de Transações Financeiras
 * 
 * Agrupa todos os recursos do módulo financeiro seguindo Clean Architecture:
 * - Controllers (Presentation Layer) - Recebem requests HTTP
 * - Use Cases (Application Layer) - Orquestram regras de negócio
 * - Repositories (Infrastructure Layer) - Persistência de dados (PostgreSQL via TypeORM)
 * - Adapters (Infrastructure Layer) - Processamento de Excel
 * 
 * NOVO: Sistema de upload flexível com mapeamento e validação (PendingDocuments)
 */
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        secret: envService.jwtSecret,
        signOptions: {
          expiresIn: envService.jwtExpiresIn as any,
        },
      }),
    }),
    TypeOrmModule.forFeature([
      FinancialTransactionSchema,
      FinancialUploadSchema, // Usando tabela existente financial_uploads
    ]),
  ],
  controllers: [
    FinancialController,
    PendingDocumentController,
  ],
  providers: [
    // Adapters
    {
      provide: 'IExcelProcessor',
      useClass: ExcelProcessorAdapter,
    },
    {
      provide: 'IExcelAnalyzer',
      useClass: ExcelAnalyzerAdapter,
    },
    
    // Repositories (PostgreSQL via TypeORM)
    {
      provide: 'IFinancialRepository',
      useClass: TypeORMFinancialRepository,                                                    
    },
    {
      provide: 'IPendingDocumentRepository',
      useClass: TypeORMFinancialUploadRepository, // Usando financial_uploads
    },
    
    // Use Cases - Sistema Original (Upload Direto)
    {
      provide: ProcessExcelUseCase,
      useFactory: (excelProcessor, repository) => {
        return new ProcessExcelUseCase(excelProcessor, repository);
      },
      inject: ['IExcelProcessor', 'IFinancialRepository'],
    },
    {
      provide: GetFinancialDataUseCase,
      useFactory: (repository) => {
        return new GetFinancialDataUseCase(repository);
      },
      inject: ['IFinancialRepository'],
    },

    // Use Cases - Sistema Novo (Upload Flexível com Staging)
    {
      provide: UploadRawDocumentUseCase,
      useFactory: (excelAnalyzer, pendingDocRepository) => {
        return new UploadRawDocumentUseCase(excelAnalyzer, pendingDocRepository);
      },
      inject: ['IExcelAnalyzer', 'IPendingDocumentRepository'],
    },
    {
      provide: MapDocumentColumnsUseCase,
      useFactory: (pendingDocRepository) => {
        return new MapDocumentColumnsUseCase(pendingDocRepository);
      },
      inject: ['IPendingDocumentRepository'],
    },
    {
      provide: ValidateDocumentUseCase,
      useFactory: (pendingDocRepository) => {
        return new ValidateDocumentUseCase(pendingDocRepository);
      },
      inject: ['IPendingDocumentRepository'],
    },
    {
      provide: ApproveDocumentUseCase,
      useFactory: (pendingDocRepository, financialRepository, excelProcessor, dataSource) => {
        return new ApproveDocumentUseCase(
          pendingDocRepository,
          financialRepository,
          excelProcessor,
          dataSource,
        );
      },
      inject: ['IPendingDocumentRepository', 'IFinancialRepository', 'IExcelProcessor', DataSource],
    },
    {
      provide: GetPendingDocumentsUseCase,
      useFactory: (pendingDocRepository) => {
        return new GetPendingDocumentsUseCase(pendingDocRepository);
      },
      inject: ['IPendingDocumentRepository'],
    },
  ],
})
export class FinancialModule {}
