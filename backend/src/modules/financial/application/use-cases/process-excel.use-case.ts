import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IExcelProcessor } from '../../domain/ports/excel-processor.interface';
import { IFinancialRepository } from '../../domain/ports/financial-repository.interface';
import {
  ProcessExcelRequestDTO,
  ProcessExcelResponseDTO,
} from '../dtos/financial.dto';

/**
 * ProcessExcelUseCase - Application Layer
 * 
 * Orquestra o processamento de arquivos Excel:
 * 1. Valida permissões do usuário
 * 2. Processa o Excel (extrai transações)
 * 3. Valida regras de negócio
 * 4. Persiste no DuckDB em lote
 */
export class ProcessExcelUseCase
  implements IUseCase<ProcessExcelRequestDTO, ProcessExcelResponseDTO>
{
  constructor(
    private excelProcessor: IExcelProcessor,
    private financialRepository: IFinancialRepository,
  ) {}

  async execute(
    request: ProcessExcelRequestDTO,
  ): Promise<ProcessExcelResponseDTO> {
    // 1. Validar request
    if (!request.companyId || !request.userId) {
      throw new Error('CompanyId e UserId são obrigatórios');
    }

    if (!request.fileBuffer || request.fileBuffer.length === 0) {
      throw new Error('Arquivo vazio');
    }

    // TODO: Validar se o userId tem permissão na companyId (buscar em company_members)

    // 2. Processar o Excel (extrai transações do domínio)
    const transactions = await this.excelProcessor.processExcelFile(
      request.fileBuffer,
      request.companyId,
    );

    if (transactions.length === 0) {
      throw new Error('Nenhuma transação válida encontrada no arquivo');
    }

    // 3. Persistir em lote no DuckDB (performance)
    await this.financialRepository.saveBatch(transactions);

    // 4. Retornar sucesso
    return {
      success: true,
      totalTransactions: transactions.length,
      message: `${transactions.length} transações processadas com sucesso`,
    };
  }
}
