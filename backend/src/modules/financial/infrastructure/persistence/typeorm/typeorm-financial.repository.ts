import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IFinancialRepository } from '../../../domain/ports/financial-repository.interface';
import { FinancialTransaction } from '../../../domain/entities/financial-transaction';
import { FinancialDataSchema } from './financial-data.schema';
import { Money } from '../../../domain/value-objects/money';
import { TransactionType } from '../../../domain/value-objects/transaction-type';
import { Category } from '../../../domain/value-objects/category';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';

/**
 * TypeORMFinancialRepository - Infrastructure Layer
 * 
 * Implementação do IFinancialRepository usando TypeORM + PostgreSQL.
 * Persiste dados no banco de dados (ao contrário do InMemoryRepository).
 */
@Injectable()
export class TypeORMFinancialRepository implements IFinancialRepository {
  constructor(
    @InjectRepository(FinancialDataSchema)
    private readonly repository: Repository<FinancialDataSchema>,
  ) {}

  private normalizeType(value: string | null | undefined): 'RECEITA' | 'DESPESA' {
    const normalized = String(value || '').toUpperCase().trim();
    if (normalized === 'INCOME') return 'RECEITA';
    if (normalized === 'EXPENSE') return 'DESPESA';
    if (normalized === 'RECEITA') return 'RECEITA';
    if (normalized === 'DESPESA') return 'DESPESA';
    return 'DESPESA';
  }

  private getEffectiveDate(schema: FinancialDataSchema): Date {
    // financial_data stores DATE (string) for competence/payment.
    const competence = schema.dateCompetence ? new Date(schema.dateCompetence) : null;
    const payment = schema.datePayment ? new Date(schema.datePayment) : null;
    return competence || payment || schema.createdAt || new Date();
  }

  private toDomain(schema: FinancialDataSchema): FinancialTransaction {
    const amountNumber = typeof schema.amount === 'string' ? Number(schema.amount) : Number((schema as any).amount);
    const moneyOrError = Money.create(Number.isFinite(amountNumber) ? amountNumber : 0, 'BRL');
    const typeOrError = TransactionType.create(this.normalizeType(schema.type));
    const categoryOrError = Category.create(schema.category || 'Outros');

    const transactionOrError = FinancialTransaction.create(
      {
        companyId: schema.companyId,
        date: this.getEffectiveDate(schema),
        description: schema.description && schema.description.trim().length > 0 ? schema.description : '(Sem descrição)',
        amount: moneyOrError.getValue(),
        type: typeOrError.getValue(),
        category: categoryOrError.getValue(),
        competenceDate: schema.dateCompetence ? new Date(schema.dateCompetence) : undefined,
        paymentDate: schema.datePayment ? new Date(schema.datePayment) : undefined,
      },
      new UniqueEntityID(schema.id),
    );

    if (transactionOrError.isFailure) {
      // Fallback ultra defensivo: nunca quebrar o dashboard por uma linha ruim.
      const fallback = FinancialTransaction.create(
        {
          companyId: schema.companyId,
          date: this.getEffectiveDate(schema),
          description: '(Sem descrição)',
          amount: Money.create(0, 'BRL').getValue(),
          type: TransactionType.DESPESA,
          category: Category.create('Outros').getValue(),
          competenceDate: schema.dateCompetence ? new Date(schema.dateCompetence) : undefined,
          paymentDate: schema.datePayment ? new Date(schema.datePayment) : undefined,
        },
        new UniqueEntityID(schema.id),
      );
      return fallback.getValue();
    }

    return transactionOrError.getValue();
  }

  async save(transaction: FinancialTransaction): Promise<void> {
    console.log('[TypeORMRepository] save:', { id: transaction.id.toString(), companyId: transaction.companyId });

    await this.repository.save({
      id: transaction.id.toString(),
      companyId: transaction.companyId,
      uploadId: null,
      description: transaction.description,
      amount: String(transaction.amount.amount),
      dateCompetence: (transaction.competenceDate || transaction.date).toISOString().split('T')[0],
      datePayment: (transaction.paymentDate || transaction.date).toISOString().split('T')[0],
      type: transaction.type.value,
      category: transaction.category.value,
    });
  }

  async saveBatch(transactions: FinancialTransaction[]): Promise<void> {
    console.log('[TypeORMRepository] saveBatch:', { count: transactions.length });
    
    if (transactions.length === 0) return;

    const schemas: Partial<FinancialDataSchema>[] = transactions.map((t) => ({
      id: t.id.toString(),
      companyId: t.companyId,
      uploadId: null,
      description: t.description,
      amount: String(t.amount.amount),
      dateCompetence: (t.competenceDate || t.date).toISOString().split('T')[0],
      datePayment: (t.paymentDate || t.date).toISOString().split('T')[0],
      type: t.type.value,
      category: t.category.value,
    }));

    await this.repository.save(schemas);
    
    console.log('[TypeORMRepository] saveBatch complete:', { count: transactions.length });
  }

  async findByCompanyId(companyId: string): Promise<FinancialTransaction[]> {
    console.log('[TypeORMRepository] findByCompanyId:', { companyId });

    const schemas = await this.repository.find({
      where: { companyId },
      order: { createdAt: 'ASC' },
    });

    const transactions = schemas.map((s) => this.toDomain(s));
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
    
    const schemas = await this.repository
      .createQueryBuilder('t')
      .where('t.companyId = :companyId', { companyId })
      .andWhere(
        "COALESCE(t.dateCompetence, t.datePayment) BETWEEN :startDate AND :endDate",
        {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
      )
      .orderBy('COALESCE(t.dateCompetence, t.datePayment)', 'ASC')
      .getMany();

    const transactions = schemas.map((s) => this.toDomain(s));
    console.log('[TypeORMRepository] findByCompanyIdAndPeriod result:', { count: transactions.length });
    
    return transactions;
  }

  async getDateRange(companyId: string): Promise<{ earliestDate: Date | null; latestDate: Date | null }> {
    console.log('[TypeORMRepository] getDateRange:', { companyId });
    
    const result = await this.repository
      .createQueryBuilder('t')
      .select("MIN(COALESCE(t.dateCompetence, t.datePayment))", 'earliestDate')
      .addSelect("MAX(COALESCE(t.dateCompetence, t.datePayment))", 'latestDate')
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
    const qb = this.repository.createQueryBuilder('t')
      .select(
        "COALESCE(SUM(CASE WHEN UPPER(t.type) IN ('RECEITA','INCOME') THEN t.amount ELSE 0 END), 0)",
        'totalRevenue',
      )
      .addSelect(
        "COALESCE(SUM(CASE WHEN UPPER(t.type) IN ('DESPESA','EXPENSE') THEN t.amount ELSE 0 END), 0)",
        'totalExpense',
      )
      .where('t.companyId = :companyId', { companyId });

    if (startDate && endDate) {
      qb.andWhere(
        "COALESCE(t.dateCompetence, t.datePayment) BETWEEN :startDate AND :endDate",
        {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
      );
    }

    const raw = await qb.getRawOne<{ totalRevenue: string; totalExpense: string }>();
    const totalRevenue = Number(raw?.totalRevenue || 0);
    const totalExpense = Number(raw?.totalExpense || 0);
    return { totalRevenue, totalExpense, profit: totalRevenue - totalExpense };
  }

  async getMonthlyData(
    companyId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ month: string; revenue: number; expense: number }[]> {
    // Mantém a heurística de granularidade (Lote 5)
    const daysDiff = startDate && endDate
      ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      : 365;

    const groupByMonth = daysDiff > 180;
    const groupByWeek = daysDiff > 31 && daysDiff <= 180;

    const keyExpr = groupByMonth
      ? "to_char(COALESCE(t.dateCompetence, t.datePayment), 'YYYY-MM')"
      : groupByWeek
        ? "to_char(date_trunc('week', COALESCE(t.dateCompetence, t.datePayment))::date, 'YYYY-MM-DD')"
        : "to_char(COALESCE(t.dateCompetence, t.datePayment), 'YYYY-MM-DD')";

    const qb = this.repository.createQueryBuilder('t')
      .select(`${keyExpr}`, 'month')
      .addSelect(
        "COALESCE(SUM(CASE WHEN UPPER(t.type) IN ('RECEITA','INCOME') THEN t.amount ELSE 0 END), 0)",
        'revenue',
      )
      .addSelect(
        "COALESCE(SUM(CASE WHEN UPPER(t.type) IN ('DESPESA','EXPENSE') THEN t.amount ELSE 0 END), 0)",
        'expense',
      )
      .where('t.companyId = :companyId', { companyId });

    if (startDate && endDate) {
      qb.andWhere(
        "COALESCE(t.dateCompetence, t.datePayment) BETWEEN :startDate AND :endDate",
        {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
      );
    }

    const rows = await qb.groupBy('month').orderBy('month', 'ASC').getRawMany<{ month: string; revenue: string; expense: string }>();

    return rows.map((r) => ({
      month: r.month,
      revenue: Number(r.revenue || 0),
      expense: Number(r.expense || 0),
    }));
  }

  async getCategoryData(
    companyId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ category: string; revenue: number; expense: number; total: number }[]> {
    const qb = this.repository.createQueryBuilder('t')
      .select("COALESCE(t.category, 'Outros')", 'category')
      .addSelect(
        "COALESCE(SUM(CASE WHEN UPPER(t.type) IN ('RECEITA','INCOME') THEN t.amount ELSE 0 END), 0)",
        'revenue',
      )
      .addSelect(
        "COALESCE(SUM(CASE WHEN UPPER(t.type) IN ('DESPESA','EXPENSE') THEN t.amount ELSE 0 END), 0)",
        'expense',
      )
      .where('t.companyId = :companyId', { companyId });

    if (startDate && endDate) {
      qb.andWhere(
        "COALESCE(t.dateCompetence, t.datePayment) BETWEEN :startDate AND :endDate",
        {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
      );
    }

    const rows = await qb.groupBy('category').getRawMany<{ category: string; revenue: string; expense: string }>();

    return rows
      .map((r) => {
        const revenue = Number(r.revenue || 0);
        const expense = Number(r.expense || 0);
        return { category: r.category, revenue, expense, total: revenue + expense };
      })
      .sort((a, b) => b.total - a.total);
  }

  async getTrendData(
    companyId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date,
    granularity: 'day' | 'week' | 'month' = 'day',
  ): Promise<{ date: string; revenue: number; expense: number; profit: number }[]> {
    const keyExpr = granularity === 'month'
      ? "to_char(date_trunc('month', COALESCE(t.dateCompetence, t.datePayment))::date, 'YYYY-MM')"
      : granularity === 'week'
        ? "to_char(date_trunc('week', COALESCE(t.dateCompetence, t.datePayment))::date, 'YYYY-MM-DD')"
        : "to_char(COALESCE(t.dateCompetence, t.datePayment), 'YYYY-MM-DD')";

    const qb = this.repository.createQueryBuilder('t')
      .select(`${keyExpr}`, 'date')
      .addSelect(
        "COALESCE(SUM(CASE WHEN UPPER(t.type) IN ('RECEITA','INCOME') THEN t.amount ELSE 0 END), 0)",
        'revenue',
      )
      .addSelect(
        "COALESCE(SUM(CASE WHEN UPPER(t.type) IN ('DESPESA','EXPENSE') THEN t.amount ELSE 0 END), 0)",
        'expense',
      )
      .where('t.companyId = :companyId', { companyId });

    if (startDate && endDate) {
      qb.andWhere(
        "COALESCE(t.dateCompetence, t.datePayment) BETWEEN :startDate AND :endDate",
        {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
      );
    }

    const rows = await qb.groupBy('date').orderBy('date', 'ASC').getRawMany<{ date: string; revenue: string; expense: string }>();

    return rows.map((r) => {
      const revenue = Number(r.revenue || 0);
      const expense = Number(r.expense || 0);
      return { date: r.date, revenue, expense, profit: revenue - expense };
    });
  }
}
