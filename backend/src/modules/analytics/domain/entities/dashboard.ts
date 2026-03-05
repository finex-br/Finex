import { Entity } from '../../../../shared/core/entity';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';
import { Result } from '../../../../shared/core/result';

interface DashboardProps {
  companyId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Dashboard extends Entity<DashboardProps> {
  get companyId(): string { return this.props.companyId; }
  get name(): string { return this.props.name; }
  get description(): string | undefined { return this.props.description; }
  get isDefault(): boolean { return this.props.isDefault; }
  get createdBy(): string { return this.props.createdBy; }
  get createdAt(): Date | undefined { return this.props.createdAt; }
  get updatedAt(): Date | undefined { return this.props.updatedAt; }

  private constructor(props: DashboardProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public update(data: {
    name?: string;
    description?: string;
    isDefault?: boolean;
  }): void {
    if (data.name !== undefined) this.props.name = data.name;
    if (data.description !== undefined) this.props.description = data.description;
    if (data.isDefault !== undefined) this.props.isDefault = data.isDefault;
    this.props.updatedAt = new Date();
  }

  public static create(props: DashboardProps, id?: UniqueEntityID): Result<Dashboard> {
    if (!props.companyId) return Result.fail<Dashboard>('companyId is required');
    if (!props.name) return Result.fail<Dashboard>('name is required');
    if (!props.createdBy) return Result.fail<Dashboard>('createdBy is required');

    return Result.ok<Dashboard>(
      new Dashboard(
        {
          ...props,
          isDefault: props.isDefault ?? false,
          createdAt: props.createdAt ?? new Date(),
          updatedAt: props.updatedAt ?? new Date(),
        },
        id,
      ),
    );
  }
}
