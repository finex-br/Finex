import { Entity } from '../../../../shared/core/entity';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';
import { Result } from '../../../../shared/core/result';
import { ChartType } from '../value-objects/chart-type';
import { DataSourceConfig } from '../value-objects/data-source-config';
import { VisualConfig } from '../value-objects/visual-config';
import { GridPosition } from '../value-objects/grid-position';

interface ChartConfigProps {
  dashboardId: string;
  companyId: string;
  name: string;
  chartType: ChartType;
  dataSource: DataSourceConfig;
  visualConfig: VisualConfig;
  position: GridPosition;
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ChartConfig extends Entity<ChartConfigProps> {
  get dashboardId(): string { return this.props.dashboardId; }
  get companyId(): string { return this.props.companyId; }
  get name(): string { return this.props.name; }
  get chartType(): ChartType { return this.props.chartType; }
  get dataSource(): DataSourceConfig { return this.props.dataSource; }
  get visualConfig(): VisualConfig { return this.props.visualConfig; }
  get position(): GridPosition { return this.props.position; }
  get displayOrder(): number { return this.props.displayOrder; }
  get createdAt(): Date | undefined { return this.props.createdAt; }
  get updatedAt(): Date | undefined { return this.props.updatedAt; }

  private constructor(props: ChartConfigProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public update(data: {
    name?: string;
    chartType?: ChartType;
    dataSource?: DataSourceConfig;
    visualConfig?: VisualConfig;
    position?: GridPosition;
    displayOrder?: number;
  }): void {
    if (data.name !== undefined) this.props.name = data.name;
    if (data.chartType !== undefined) this.props.chartType = data.chartType;
    if (data.dataSource !== undefined) this.props.dataSource = data.dataSource;
    if (data.visualConfig !== undefined) this.props.visualConfig = data.visualConfig;
    if (data.position !== undefined) this.props.position = data.position;
    if (data.displayOrder !== undefined) this.props.displayOrder = data.displayOrder;
    this.props.updatedAt = new Date();
  }

  public static create(props: ChartConfigProps, id?: UniqueEntityID): Result<ChartConfig> {
    if (!props.dashboardId) return Result.fail<ChartConfig>('dashboardId is required');
    if (!props.companyId) return Result.fail<ChartConfig>('companyId is required');
    if (!props.name) return Result.fail<ChartConfig>('name is required');

    return Result.ok<ChartConfig>(
      new ChartConfig(
        {
          ...props,
          position: props.position ?? { x: 0, y: 0, width: 6, height: 4 },
          displayOrder: props.displayOrder ?? 0,
          createdAt: props.createdAt ?? new Date(),
          updatedAt: props.updatedAt ?? new Date(),
        },
        id,
      ),
    );
  }
}
