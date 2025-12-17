import { FinancialTransaction } from '../../../domain/entities/financial-transaction';
import { FinancialTransactionSchema } from './financial-transaction.schema';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { Money } from '../../../domain/value-objects/money';
import { TransactionType } from '../../../domain/value-objects/transaction-type';
import { Category } from '../../../domain/value-objects/category';
import { Result } from '../../../../../shared/core/result';

/**
 * FinancialTransactionMapper - Converte Domain ↔ Persistence
 * 
 * Responsabilidades:
 * - toDomain: Schema (TypeORM) → Domain Entity
 * - toPersistence: Domain Entity → Schema (TypeORM)
 * 
 * Mantém separação limpa entre camadas (Domain não conhece TypeORM).
 */
export class FinancialTransactionMapper {
  /**
   * Converte TypeORM Schema para Domain Entity
   */
  public static toDomain(schema: FinancialTransactionSchema): FinancialTransaction | null {
    // Reconstrói Value Objects
    const moneyOrError = Money.create(schema.amountValue, schema.amountCurrency);
    const typeOrError = TransactionType.create(schema.type);
    const categoryOrError = Category.create(schema.categoryName);

    // Valida Value Objects
    if (moneyOrError.isFailure || typeOrError.isFailure || categoryOrError.isFailure) {
      console.error('[FinancialTransactionMapper] Erro ao reconstruir Value Objects:', {
        money: moneyOrError.isFailure ? moneyOrError.error : 'OK',
        type: typeOrError.isFailure ? typeOrError.error : 'OK',
        category: categoryOrError.isFailure ? categoryOrError.error : 'OK',
      });
      return null;
    }

    // Cria Domain Entity
    const transactionOrError = FinancialTransaction.create(
      {
        companyId: schema.companyId,
        date: schema.date,
        description: schema.description,
        amount: moneyOrError.getValue(),
        type: typeOrError.getValue(),
        category: categoryOrError.getValue(),
        competenceDate: schema.competenceDate ?? undefined,
        paymentDate: schema.paymentDate ?? undefined,
      },
      new UniqueEntityID(schema.id),
    );

    if (transactionOrError.isFailure) {
      console.error('[FinancialTransactionMapper] Erro ao criar Domain Entity:', transactionOrError.error);
      return null;
    }

    return transactionOrError.getValue();
  }

  /**
   * Converte Domain Entity para TypeORM Schema
   */
  public static toPersistence(transaction: FinancialTransaction): FinancialTransactionSchema {
    const schema = new FinancialTransactionSchema();
    
    schema.id = transaction.id.toString();
    schema.companyId = transaction.companyId;
    schema.date = transaction.date;
    schema.description = transaction.description;
    
    // Money Value Object → Campos separados
    schema.amountValue = transaction.amount.amount;
    schema.amountCurrency = transaction.amount.currency;
    
    // TransactionType Value Object → String
    schema.type = transaction.type.value;
    
    // Category Value Object → String
    schema.categoryName = transaction.category.value;
    
    schema.competenceDate = transaction.competenceDate ?? null;
    schema.paymentDate = transaction.paymentDate ?? null;
    
    schema.createdAt = transaction.createdAt;
    schema.updatedAt = transaction.updatedAt;

    return schema;
  }

  /**
   * Converte array de Schemas para Domain Entities (filtra nulls)
   */
  public static toDomainBulk(schemas: FinancialTransactionSchema[]): FinancialTransaction[] {
    return schemas
      .map((schema) => this.toDomain(schema))
      .filter((transaction): transaction is FinancialTransaction => transaction !== null);
  }

  /**
   * Converte array de Domain Entities para Schemas
   */
  public static toPersistenceBulk(transactions: FinancialTransaction[]): FinancialTransactionSchema[] {
    return transactions.map((transaction) => this.toPersistence(transaction));
  }
}
