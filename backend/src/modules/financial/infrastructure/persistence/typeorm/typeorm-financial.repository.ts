import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { IFinancialRepository } from '../../../domain/ports/financial-repository.interface';
import { FinancialTransaction } from '../../../domain/entities/financial-transaction';
import { FinancialTransactionSchema } from './financial-transaction.schema';
import { FinancialTransactionMapper } from './financial-transaction.mapper';

/**
 * TypeORMFinancialRepository - Infrastructure Layer
 * 
 * Implementação do IFinancialRepository usando TypeORM + PostgreSQL.
 * Persiste dados no banco de dados (ao contrário do InMemoryRepository).
 */
@Injectable()
export class TypeORMFinancialRepository implements IFinancialRepository {
  constructor(
    @InjectRepository(FinancialTransactionSchema)
    private readonly repository: Repository<FinancialTransactionSchema>,
  ) {}

  async save(transaction: FinancialTransaction): Promise<void> {
    console.log('[TypeORMRepository] save:', { id: transaction.id.toString(), companyId: transaction.companyId });
    
    const schema = FinancialTransactionMapper.toPersistence(transaction);
    await this.repository.save(schema);
  }

  async saveBatch(transactions: FinancialTransaction[]): Promise<void> {
    console.log('[TypeORMRepository] saveBatch:', { count: transactions.length });
    
    if (transactions.length === 0) return;
    
    const schemas = FinancialTransactionMapper.toPersistenceBulk(transactions);
    await this.repository.save(schemas);
    
    console.log('[TypeORMRepository] saveBatch complete:', { count: transactions.length });
  }

  async findByCompanyId(companyId: string): Promise<FinancialTransaction[]> {
    console.log('[TypeORMRepository] findByCompanyId:', { companyId });
    
    const schemas = await this.repository.find({
      where: { companyId },
      order: { date: 'ASC' },
    });
    
    const transactions = FinancialTransactionMapper.toDomainBulk(schemas);
    console.log('[TypeORMRepository] findByCompanyId result:', { count: transactions.length });
    
    return transactions;
  }

  async findByCompanyIdAndPeriod(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<FinancialTransaction[]> {
    console.log('[TypeORMRepository] findByCompanyIdAndPeriod:', { 
      companyId, 
      startDate: startDate.toISOString(), 
      endDate: endDate.toISOString() 
    });
    
    const schemas = await this.repository.find({
      where: {
        companyId,
        date: Between(startDate, endDate),
      },
      order: { date: 'ASC' },
    });
    
    const transactions = FinancialTransactionMapper.toDomainBulk(schemas);
    console.log('[TypeORMRepository] findByCompanyIdAndPeriod result:', { count: transactions.length });
    
    return transactions;
  }

  async getDateRange(companyId: string): Promise<{ earliestDate: Date | null; latestDate: Date | null }> {
    console.log('[TypeORMRepository] getDateRange:', { companyId });
    
    const result = await this.repository
      .createQueryBuilder('t')
      .select('MIN(t.date)', 'earliestDate')
      .addSelect('MAX(t.date)', 'latestDate')
      .where('t.companyId = :companyId', { companyId })
      .getRawOne<{ earliestDate: Date | null; latestDate: Date | null }>();
    
    console.log('[TypeORMRepository] getDateRange result:', result);
    
    return {
      earliestDate: result?.earliestDate || null,
      latestDate: result?.latestDate || null,
    };
  }

  async countAll(companyId: string): Promise<number> {
    console.log('[TypeORMRepository] countAll:', { companyId });
    
    const count = await this.repository.count({
      where: { companyId },
    });
    
    console.log('[TypeORMRepository] countAll result:', { count });
    
    return count;
  }

  async deleteAll(): Promise<void> {
    console.log('[TypeORMRepository] deleteAll');
    await this.repository.clear();
  }

  // Métodos de agregação (Application Layer depende deles)
  async calculateSummary(
    companyId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ totalRevenue: number; totalExpense: number; profit: number }> {
    const transactions = startDate && endDate
      ? await this.findByCompanyIdAndPeriod(companyId, startDate, endDate)
      : await this.findByCompanyId(companyId);

    const totalRevenue = transactions
      .filter(t => t.type.isRevenue())
      .reduce((sum, t) => sum + t.amount.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type.isExpense())
      .reduce((sum, t) => sum + t.amount.amount, 0);

    return { totalRevenue, totalExpense, profit: totalRevenue - totalExpense };
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
      const month = t.date.toISOString().substring(0, 7);
      if (!monthlyMap.has(month)) monthlyMap.set(month, { revenue: 0, expense: 0 });
      const data = monthlyMap.get(month)!;
      if (t.type.isRevenue()) data.revenue += t.amount.amount;
      else data.expense += t.amount.amount;
    });

    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
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
      if (!categoryMap.has(category)) categoryMap.set(category, { revenue: 0, expense: 0 });
      const data = categoryMap.get(category)!;
      if (t.type.isRevenue()) data.revenue += t.amount.amount;
      else data.expense += t.amount.amount;
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data, total: data.revenue + data.expense }))
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
      const date = t.date.toISOString().substring(0, 10);
      if (!trendMap.has(date)) trendMap.set(date, { revenue: 0, expense: 0 });
      const data = trendMap.get(date)!;
      if (t.type.isRevenue()) data.revenue += t.amount.amount;
      else data.expense += t.amount.amount;
    });

    return Array.from(trendMap.entries())
      .map(([date, data]) => ({ date, ...data, profit: data.revenue - data.expense }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
