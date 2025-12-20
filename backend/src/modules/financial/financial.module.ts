import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialController } from './presentation/controllers/financial.controller';
import { ProcessExcelUseCase } from './application/use-cases/process-excel.use-case';
import { GetFinancialDataUseCase } from './application/use-cases/get-financial-data.use-case';
import { ExcelProcessorAdapter } from './infrastructure/adapters/excel-processor.adapter';
import { TypeORMFinancialRepository } from './infrastructure/persistence/typeorm/typeorm-financial.repository';
import { FinancialTransactionSchema } from './infrastructure/persistence/typeorm/financial-transaction.schema';

/**
 * FinancialModule - Módulo de Transações Financeiras
 * 
 * Agrupa todos os recursos do módulo financeiro seguindo Clean Architecture:
 * - Controllers (Presentation Layer) - Recebem requests HTTP
 * - Use Cases (Application Layer) - Orquestram regras de negócio
 * - Repositories (Infrastructure Layer) - Persistência de dados (PostgreSQL via TypeORM)
 * - Adapters (Infrastructure Layer) - Processamento de Excel
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([FinancialTransactionSchema]),
  ],
  controllers: [
    FinancialController,
  ],
  providers: [
    // Adapters
    {
      provide: 'IExcelProcessor',
      useClass: ExcelProcessorAdapter,
    },
    
    // Repositories (PostgreSQL via TypeORM)
    {
      provide: 'IFinancialRepository',
      useClass: TypeORMFinancialRepository,
    },
    
    // Use Cases
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
  ],
})
export class FinancialModule {}
