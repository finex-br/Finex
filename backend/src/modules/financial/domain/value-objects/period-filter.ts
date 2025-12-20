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
   * FILTROS INTELIGENTES:
   * - Se dataRange fornecido: calcula períodos baseados nos dados reais (latestDate)
   * - Se não fornecido: calcula baseado na data atual (comportamento padrão)
   * 
   * Exemplos:
   * - MONTH com latestDate=2024-04-30 → últimos 30 dias dos dados (2024-04-01 a 2024-04-30)
   * - MONTH sem dataRange → últimos 30 dias de hoje
   * 
   * @param dataRange - Range de datas disponíveis no sistema (opcional)
   */
  public getDateRange(dataRange?: {
    earliestDate: Date;
    latestDate: Date;
  }): { startDate: Date; endDate: Date } {
    // Se CUSTOM, sempre retorna as datas fornecidas
    if (this.props.type === 'CUSTOM') {
      return {
        startDate: this.props.startDate!,
        endDate: this.props.endDate!,
      };
    }

    // Determinar data de referência (dados reais ou hoje)
    const referenceDate = dataRange?.latestDate || new Date();
    const endDate = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate()
    );

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

    console.log('[PeriodFilter] Calculado:', {
      type: this.props.type,
      referenceDate: dataRange ? 'DADOS' : 'HOJE',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });

    return { startDate, endDate };
  }
}
