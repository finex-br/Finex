import { ValueObject } from '../../../../shared/core/value-object';
import { Result } from '../../../../shared/core/result';

interface TransactionTypeProps {
  value: 'RECEITA' | 'DESPESA';
}

/**
 * TransactionType - Value Object
 * 
 * Representa o tipo de transação financeira.
 * Garante que apenas valores válidos sejam aceitos.
 */
export class TransactionType extends ValueObject<TransactionTypeProps> {
  public static readonly RECEITA = new TransactionType({ value: 'RECEITA' });
  public static readonly DESPESA = new TransactionType({ value: 'DESPESA' });

  private constructor(props: TransactionTypeProps) {
    super(props);
  }

  get value(): 'RECEITA' | 'DESPESA' {
    return this.props.value;
  }

  public isRevenue(): boolean {
    return this.props.value === 'RECEITA';
  }

  public isExpense(): boolean {
    return this.props.value === 'DESPESA';
  }

  /**
   * Factory method para criar TransactionType
   * 
   * @param value - String com o tipo ('RECEITA' ou 'DESPESA')
   * @returns Result<TransactionType>
   */
  public static create(value: string): Result<TransactionType> {
    const normalized = value.toUpperCase().trim();

    if (normalized === 'RECEITA') {
      return Result.ok<TransactionType>(TransactionType.RECEITA);
    }

    if (normalized === 'DESPESA') {
      return Result.ok<TransactionType>(TransactionType.DESPESA);
    }

    return Result.fail<TransactionType>('Tipo de transação inválido. Use RECEITA ou DESPESA');
  }
}
