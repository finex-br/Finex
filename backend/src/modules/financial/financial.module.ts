import { Module } from '@nestjs/common';
import { FinancialController } from './presentation/controllers/financial.controller';
import { ProcessExcelUseCase } from './application/use-cases/process-excel.use-case';
import { GetFinancialDataUseCase } from './application/use-cases/get-financial-data.use-case';
import { ExcelProcessorAdapter } from './infrastructure/adapters/excel-processor.adapter';
import { InMemoryFinancialRepository } from './infrastructure/repositories/in-memory-financial.repository';

/**
 * FinancialModule - Módulo de Transações Financeiras
 * 
 * Agrupa todos os recursos do módulo financeiro seguindo Clean Architecture:
 * - Controllers (Presentation Layer) - Recebem requests HTTP
 * - Use Cases (Application Layer) - Orquestram regras de negócio
 * - Repositories (Infrastructure Layer) - Persistência de dados
 * - Adapters (Infrastructure Layer) - Processamento de Excel
 * 
 * NOTA: Usando InMemoryRepository temporariamente até DuckDB/Postgres.
 */
@Module({
  controllers: [
    FinancialController,
  ],
  providers: [
    // Adapters
    {
      provide: 'IExcelProcessor',
      useClass: ExcelProcessorAdapter,
    },
    
    // Repositories (In-Memory para dev)
    {
      provide: 'IFinancialRepository',
      useClass: InMemoryFinancialRepository,
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
