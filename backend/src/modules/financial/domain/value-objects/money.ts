import { ValueObject } from '../../../../shared/core/value-object';
import { Result } from '../../../../shared/core/result';

interface MoneyProps {
  amount: number;
  currency: string;
}

/**
 * Money - Value Object
 * 
 * Representa valores monetários com validação de negócio.
 * Garante que valores financeiros sejam sempre válidos.
 */
export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  /**
   * Formata o valor em Real Brasileiro
   */
  public format(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: this.props.currency,
    }).format(this.props.amount);
  }

  /**
   * Factory method para criar Money
   * 
   * @param amount - Valor numérico
   * @param currency - Código da moeda (padrão: BRL)
   * @returns Result<Money>
   */
  public static create(amount: number, currency: string = 'BRL'): Result<Money> {
    if (isNaN(amount)) {
      return Result.fail<Money>('Valor inválido');
    }

    if (!currency || currency.length !== 3) {
      return Result.fail<Money>('Código de moeda inválido (deve ter 3 caracteres)');
    }

    return Result.ok<Money>(new Money({ amount, currency: currency.toUpperCase() }));
  }

  /**
   * Adiciona dois valores monetários (mesma moeda)
   */
  public add(money: Money): Result<Money> {
    if (this.currency !== money.currency) {
      return Result.fail<Money>('Não é possível somar valores de moedas diferentes');
    }

    return Money.create(this.amount + money.amount, this.currency);
  }

  /**
   * Subtrai dois valores monetários (mesma moeda)
   */
  public subtract(money: Money): Result<Money> {
    if (this.currency !== money.currency) {
      return Result.fail<Money>('Não é possível subtrair valores de moedas diferentes');
    }

    return Money.create(this.amount - money.amount, this.currency);
  }
}
