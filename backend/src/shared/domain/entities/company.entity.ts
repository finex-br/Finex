import { Entity } from '../../core/entity';
import { UniqueEntityID } from '../../core/unique-entity-id';
import { Result } from '../../core/result';
import { CNPJ } from '../value-objects/cnpj';

interface CompanyProps {
  name: string;
  cnpj?: CNPJ;
  sector?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Company Entity
 * Represents a business company in the system
 */
export class Company extends Entity<CompanyProps> {
  private constructor(props: CompanyProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get cnpj(): CNPJ | undefined {
    return this.props.cnpj;
  }

  get sector(): string | undefined {
    return this.props.sector;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public static create(props: CompanyProps, id?: UniqueEntityID): Result<Company> {
    // Validate required fields
    if (!props.name || props.name.trim().length === 0) {
      return Result.fail<Company>('Company name is required');
    }

    if (props.name.trim().length < 3) {
      return Result.fail<Company>('Company name must be at least 3 characters');
    }

    // Create company
    const company = new Company(
      {
        ...props,
        name: props.name.trim(),
      },
      id,
    );

    return Result.ok<Company>(company);
  }
}
