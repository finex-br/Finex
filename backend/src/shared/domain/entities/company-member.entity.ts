import { Entity } from '../../core/entity';
import { UniqueEntityID } from '../../core/unique-entity-id';
import { Result } from '../../core/result';

interface CompanyMemberProps {
  userId: UniqueEntityID;
  companyId: UniqueEntityID;
  role: 'OWNER' | 'VIEWER';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * CompanyMember Entity
 * Represents the relationship between a user and a company
 */
export class CompanyMember extends Entity<CompanyMemberProps> {
  private constructor(props: CompanyMemberProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get userId(): UniqueEntityID {
    return this.props.userId;
  }

  get companyId(): UniqueEntityID {
    return this.props.companyId;
  }

  get role(): 'OWNER' | 'VIEWER' {
    return this.props.role;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public static create(
    props: CompanyMemberProps,
    id?: UniqueEntityID,
  ): Result<CompanyMember> {
    // Validate role
    if (!['OWNER', 'VIEWER'].includes(props.role)) {
      return Result.fail<CompanyMember>('Invalid role. Must be OWNER or VIEWER');
    }

    const member = new CompanyMember(props, id);

    return Result.ok<CompanyMember>(member);
  }
}
