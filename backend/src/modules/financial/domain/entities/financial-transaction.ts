import { Entity } from '../../../../shared/core/entity';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';
import { Result } from '../../../../shared/core/result';
import { Money } from '../value-objects/money';
import { TransactionType } from '../value-objects/transaction-type';
import { Category } from '../value-objects/category';

interface FinancialTransactionProps {
  companyId: string;
  date: Date;
  description: string;
  amount: Money;
  type: TransactionType;
  category: Category;
  competenceDate?: Date;
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * FinancialTransaction - Aggregate Root
 * 
 * Representa uma transação financeira (receita ou despesa).
 * Armazena regras de negócio e validações do domínio.
 */
export class FinancialTransaction extends Entity<FinancialTransactionProps> {
  private constructor(props: FinancialTransactionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get companyId(): string {
    return this.props.companyId;
  }

  get date(): Date {
    return this.props.date;
  }

  get description(): string {
    return this.props.description;
  }

  get amount(): Money {
    return this.props.amount;
  }

  get type(): TransactionType {
    return this.props.type;
  }

  get category(): Category {
    return this.props.category;
  }

  get competenceDate(): Date | undefined {
    return this.props.competenceDate;
  }

  get paymentDate(): Date | undefined {
    return this.props.paymentDate;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Retorna o mês/ano da competência no formato "Jan/2024"
   */
  public getCompetenceMonth(): string {
    const date = this.competenceDate || this.date;
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${monthNames[date.getMonth()]}/${date.getFullYear()}`;
  }

  /**
   * Factory method para criar uma FinancialTransaction
   */
  public static create(
    props: Omit<FinancialTransactionProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ): Result<FinancialTransaction> {
    // Validações de negócio
    if (!props.companyId || props.companyId.trim().length === 0) {
      return Result.fail<FinancialTransaction>('CompanyId é obrigatório');
    }

    if (!props.description || props.description.trim().length === 0) {
      return Result.fail<FinancialTransaction>('Descrição é obrigatória');
    }

    if (props.description.length > 500) {
      return Result.fail<FinancialTransaction>('Descrição muito longa (máximo 500 caracteres)');
    }

    const now = new Date();
    const transaction = new FinancialTransaction(
      {
        ...props,
        createdAt: now,
        updatedAt: now,
      },
      id,
    );

    return Result.ok<FinancialTransaction>(transaction);
  }
}
