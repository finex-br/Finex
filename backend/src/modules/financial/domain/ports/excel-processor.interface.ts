import { FinancialTransaction } from '../entities/financial-transaction';

/**
 * IExcelProcessor - Port (Interface)
 * 
 * Define o contrato para processamento de arquivos Excel.
 * Implementação em Infrastructure Layer (xlsx library).
 */
export interface IExcelProcessor {
  /**
   * Processa um arquivo Excel e extrai transações financeiras
   * 
   * @param fileBuffer - Buffer do arquivo Excel
   * @param companyId - ID da empresa proprietária dos dados
   * @returns Array de FinancialTransaction do domínio
   */
  processExcelFile(
    fileBuffer: Buffer,
    companyId: string,
  ): Promise<FinancialTransaction[]>;
}
