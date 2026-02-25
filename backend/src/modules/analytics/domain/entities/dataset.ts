import { Entity } from '../../../../shared/core/entity';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';
import { Result } from '../../../../shared/core/result';
import { ColumnInfo } from '../value-objects/column-info';

interface DatasetProps {
  companyId: string;
  uploadedBy: string;
  name: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  columns: ColumnInfo[];
  rowCount: number;
  status: 'ACTIVE' | 'DELETED';
  createdAt?: Date;
  updatedAt?: Date;
}

export class Dataset extends Entity<DatasetProps> {
  get companyId(): string { return this.props.companyId; }
  get uploadedBy(): string { return this.props.uploadedBy; }
  get name(): string { return this.props.name; }
  get fileName(): string { return this.props.fileName; }
  get fileSize(): number { return this.props.fileSize; }
  get mimeType(): string { return this.props.mimeType; }
  get columns(): ColumnInfo[] { return this.props.columns; }
  get rowCount(): number { return this.props.rowCount; }
  get status(): string { return this.props.status; }
  get createdAt(): Date | undefined { return this.props.createdAt; }
  get updatedAt(): Date | undefined { return this.props.updatedAt; }

  private constructor(props: DatasetProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public markDeleted(): void {
    this.props.status = 'DELETED';
    this.props.updatedAt = new Date();
  }

  public updateColumns(columns: ColumnInfo[], rowCount: number): void {
    this.props.columns = columns;
    this.props.rowCount = rowCount;
    this.props.updatedAt = new Date();
  }

  public static create(props: DatasetProps, id?: UniqueEntityID): Result<Dataset> {
    if (!props.companyId) return Result.fail<Dataset>('companyId is required');
    if (!props.name) return Result.fail<Dataset>('name is required');
    if (!props.fileName) return Result.fail<Dataset>('fileName is required');

    return Result.ok<Dataset>(
      new Dataset(
        {
          ...props,
          status: props.status ?? 'ACTIVE',
          createdAt: props.createdAt ?? new Date(),
          updatedAt: props.updatedAt ?? new Date(),
        },
        id,
      ),
    );
  }
}
