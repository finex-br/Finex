import { Result } from '../../../../shared/core/result';
import { ValueObject } from '../../../../shared/core/value-object';

interface PeriodFilterProps {
  type: 'WEEK' | 'MONTH' | 'QUARTER' | 'SEMESTER' | 'YEAR' | 'CUSTOM';
  startDate?: Date;
  endDate?: Date;
}

/**
 * PeriodFilter Value Object
 * 
 * Representa um filtro de período com validações de negócio.
 * Suporta períodos predefinidos (WEEK, MONTH, etc) e customizados.
 */
export class PeriodFilter extends ValueObject<PeriodFilterProps> {
  get type(): string {
    return this.props.type;
  }

  get startDate(): Date | undefined {
    return this.props.startDate;
  }

  get endDate(): Date | undefined {
    return this.props.endDate;
  }

  private constructor(props: PeriodFilterProps) {
    super(props);
  }

  /**
   * Factory method com validações de negócio
   */
  public static create(props: PeriodFilterProps): Result<PeriodFilter> {
    // Validação: CUSTOM requer datas
    if (props.type === 'CUSTOM') {
      if (!props.startDate || !props.endDate) {
        return Result.fail('Período customizado requer startDate e endDate');
      }
      if (props.startDate > props.endDate) {
        return Result.fail('startDate não pode ser maior que endDate');
      }
    }

    // Validação: Tipos predefinidos não devem ter datas
    if (props.type !== 'CUSTOM' && (props.startDate || props.endDate)) {
      return Result.fail('Tipos predefinidos não devem ter startDate/endDate');
    }

    return Result.ok(new PeriodFilter(props));
  }

  /**
   * Calcula datas reais com base no tipo de período
   * 
   * Para tipos predefinidos, calcula a partir da data atual.
   * Para CUSTOM, retorna as datas fornecidas.
   */
  public getDateRange(): { startDate: Date; endDate: Date } {
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (this.props.type === 'CUSTOM') {
      return {
        startDate: this.props.startDate!,
        endDate: this.props.endDate!,
      };
    }

    let startDate: Date;

    switch (this.props.type) {
      case 'WEEK':
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'MONTH':
        startDate = new Date(endDate);
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'QUARTER':
        startDate = new Date(endDate);
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'SEMESTER':
        startDate = new Date(endDate);
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case 'YEAR':
        startDate = new Date(endDate);
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        throw new Error('Tipo de período inválido');
    }

    return { startDate, endDate };
  }
}
