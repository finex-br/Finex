import { ValueObject } from '../../../../shared/core/value-object';
import { Result } from '../../../../shared/core/result';

export enum ChartTypeEnum {
  BAR = 'BAR',
  LINE = 'LINE',
  PIE = 'PIE',
  AREA = 'AREA',
  KPI = 'KPI',
  TABLE = 'TABLE',
  STATUS = 'STATUS',
  SCATTER = 'SCATTER',
  HEATMAP = 'HEATMAP',
  GAUGE = 'GAUGE',
}

interface ChartTypeProps {
  value: ChartTypeEnum;
}

export class ChartType extends ValueObject<ChartTypeProps> {
  get value(): ChartTypeEnum {
    return this.props.value;
  }

  private constructor(props: ChartTypeProps) {
    super(props);
  }

  public static create(value: string): Result<ChartType> {
    const upperValue = value?.toUpperCase();
    if (!Object.values(ChartTypeEnum).includes(upperValue as ChartTypeEnum)) {
      return Result.fail<ChartType>(
        `Invalid chart type: ${value}. Valid types: ${Object.values(ChartTypeEnum).join(', ')}`,
      );
    }
    return Result.ok<ChartType>(new ChartType({ value: upperValue as ChartTypeEnum }));
  }
}
