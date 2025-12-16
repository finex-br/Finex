import { FinancialTransaction } from '../entities/financial-transaction';

/**
 * IFinancialRepository - Port (Interface)
 * 
 * Define o contrato para persistência de transações financeiras.
 * Implementação em Infrastructure Layer (DuckDB).
 */
export interface IFinancialRepository {
  /**
   * Salva uma transação financeira no DuckDB
   */
  save(transaction: FinancialTransaction): Promise<void>;

  /**
   * Salva múltiplas transações em lote (performance)
   */
  saveBatch(transactions: FinancialTransaction[]): Promise<void>;

  /**
   * Busca transações de uma empresa
   */
  findByCompanyId(companyId: string): Promise<FinancialTransaction[]>;

  /**
   * Busca transações por período
   */
  findByCompanyIdAndPeriod(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<FinancialTransaction[]>;

  /**
   * Calcula agregações (SUM, AVG) para dashboard
   */
  calculateSummary(companyId: string): Promise<{
    totalRevenue: number;
    totalExpense: number;
    profit: number;
  }>;

  /**
   * Agrupa transações por mês
   */
  getMonthlyData(companyId: string): Promise<Array<{
    month: string;
    revenue: number;
    expense: number;
  }>>;
}
