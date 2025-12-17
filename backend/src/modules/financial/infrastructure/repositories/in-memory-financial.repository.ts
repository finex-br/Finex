import { Injectable } from '@nestjs/common';
import { IFinancialRepository } from '../../domain/ports/financial-repository.interface';
import { FinancialTransaction } from '../../domain/entities/financial-transaction';

/**
 * InMemoryFinancialRepository - Infrastructure Layer (Temporary)
 * 
 * Implementação em memória do IFinancialRepository.
 * Usado temporariamente até integrarmos DuckDB ou PostgreSQL.
 * 
 * IMPORTANTE: Dados são perdidos quando o servidor reinicia.
 */
@Injectable()
export class InMemoryFinancialRepository implements IFinancialRepository {
  private transactions: Map<string, FinancialTransaction[]> = new Map();

  async save(transaction: FinancialTransaction): Promise<void> {
    const companyId = transaction.companyId;
    
    if (!this.transactions.has(companyId)) {
      this.transactions.set(companyId, []);
    }
    
    this.transactions.get(companyId)!.push(transaction);
  }

  async saveBatch(transactions: FinancialTransaction[]): Promise<void> {
    console.log('[InMemoryRepository] Salvando batch:', transactions.length, 'transações');
    
    for (const transaction of transactions) {
      await this.save(transaction);
    }
    
    console.log('[InMemoryRepository] Total de empresas no Map:', this.transactions.size);
    for (const [companyId, txs] of this.transactions.entries()) {
      console.log(`[InMemoryRepository] CompanyId: ${companyId} - ${txs.length} transações`);
    }
  }

  async findByCompanyId(companyId: string): Promise<FinancialTransaction[]> {
    console.log('[InMemoryRepository] Buscando por companyId:', companyId);
    const result = this.transactions.get(companyId) || [];
    console.log('[InMemoryRepository] Encontradas:', result.length, 'transações');
    return result;
  }

  async findByCompanyIdAndPeriod(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<FinancialTransaction[]> {
    const allTransactions = await this.findByCompanyId(companyId);
    
    return allTransactions.filter(t => {
      return t.date >= startDate && t.date <= endDate;
    });
  }

  async calculateSummary(
    companyId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalRevenue: number;
    totalExpense: number;
    profit: number;
  }> {
    console.log('[InMemoryRepository] calculateSummary chamado:', { companyId, startDate, endDate });
    
    const transactions = startDate && endDate
      ? await this.findByCompanyIdAndPeriod(companyId, startDate, endDate)
      : await this.findByCompanyId(companyId);

    console.log('[InMemoryRepository] Transações para calcular:', transactions.length);
    if (transactions.length > 0) {
      console.log('[InMemoryRepository] Primeira transação:', {
        type: transactions[0].type.value,
        amount: transactions[0].amount.amount,
        isRevenue: transactions[0].type.isRevenue(),
        isExpense: transactions[0].type.isExpense(),
      });
    }

    const totalRevenue = transactions
      .filter(t => t.type.isRevenue())
      .reduce((sum, t) => sum + t.amount.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type.isExpense())
      .reduce((sum, t) => sum + t.amount.amount, 0);

    const profit = totalRevenue - totalExpense;

    console.log('[InMemoryRepository] Resultado:', { totalRevenue, totalExpense, profit });

    return { totalRevenue, totalExpense, profit };
  }

  async getMonthlyData(
    companyId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ month: string; revenue: number; expense: number }[]> {
    const transactions = startDate && endDate
      ? await this.findByCompanyIdAndPeriod(companyId, startDate, endDate)
      : await this.findByCompanyId(companyId);

    const monthlyMap = new Map<string, { revenue: number; expense: number }>();

    transactions.forEach(t => {
      const month = t.date.toISOString().substring(0, 7); // YYYY-MM
      
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { revenue: 0, expense: 0 });
      }

      const data = monthlyMap.get(month)!;
      if (t.type.isRevenue()) {
        data.revenue += t.amount.amount;
      } else {
        data.expense += t.amount.amount;
      }
    });

    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        expense: data.expense,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async getCategoryData(
    companyId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ category: string; revenue: number; expense: number; total: number }[]> {
    const transactions = startDate && endDate
      ? await this.findByCompanyIdAndPeriod(companyId, startDate, endDate)
      : await this.findByCompanyId(companyId);

    const categoryMap = new Map<string, { revenue: number; expense: number }>();

    transactions.forEach(t => {
      const category = t.category.value;
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { revenue: 0, expense: 0 });
      }

      const data = categoryMap.get(category)!;
      if (t.type.isRevenue()) {
        data.revenue += t.amount.amount;
      } else {
        data.expense += t.amount.amount;
      }
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        revenue: data.revenue,
        expense: data.expense,
        total: data.revenue + data.expense,
      }))
      .sort((a, b) => b.total - a.total);
  }

  async getTrendData(
    companyId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date,
    granularity: 'day' | 'week' | 'month' = 'day',
  ): Promise<{ date: string; revenue: number; expense: number; profit: number }[]> {
    const transactions = startDate && endDate
      ? await this.findByCompanyIdAndPeriod(companyId, startDate, endDate)
      : await this.findByCompanyId(companyId);

    const trendMap = new Map<string, { revenue: number; expense: number }>();

    transactions.forEach(t => {
      const date = t.date.toISOString().substring(0, 10); // YYYY-MM-DD
      
      if (!trendMap.has(date)) {
        trendMap.set(date, { revenue: 0, expense: 0 });
      }

      const data = trendMap.get(date)!;
      if (t.type.isRevenue()) {
        data.revenue += t.amount.amount;
      } else {
        data.expense += t.amount.amount;
      }
    });

    return Array.from(trendMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        expense: data.expense,
        profit: data.revenue - data.expense,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Retorna o range de datas disponíveis (earliest e latest)
   * Usado para calcular filtros inteligentes baseados nos dados reais
   */
  async getDateRange(companyId: string): Promise<{
    earliestDate: Date | null;
    latestDate: Date | null;
  }> {
    const transactions = await this.findByCompanyId(companyId);
    
    if (transactions.length === 0) {
      return { earliestDate: null, latestDate: null };
    }

    const dates = transactions.map(t => t.date.getTime());
    const earliest = new Date(Math.min(...dates));
    const latest = new Date(Math.max(...dates));

    console.log('[InMemoryRepository] DateRange:', { 
      earliestDate: earliest.toISOString().split('T')[0],
      latestDate: latest.toISOString().split('T')[0],
      totalTransactions: transactions.length
    });

    return { earliestDate: earliest, latestDate: latest };
  }

  /**
   * Conta total de transações no sistema (sem filtro)
   * Usado para diferenciar "nunca fez upload" de "filtro vazio"
   */
  async countAll(companyId: string): Promise<number> {
    const transactions = await this.findByCompanyId(companyId);
    console.log('[InMemoryRepository] countAll:', transactions.length);
    return transactions.length;
  }
}
