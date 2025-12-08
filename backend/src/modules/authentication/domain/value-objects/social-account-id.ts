import { Result } from '../../../../shared/core/result';
import { ValueObject } from '../../../../shared/core/value-object';

interface SocialAccountIdProps {
  value: string;
}

export class SocialAccountId extends ValueObject<SocialAccountIdProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: SocialAccountIdProps) {
    super(props);
  }

  public static create(id: string): Result<SocialAccountId> {
    if (!id || id.trim().length === 0) {
      return Result.fail<SocialAccountId>('Social account ID is required');
    }

    return Result.ok<SocialAccountId>(
      new SocialAccountId({ value: id.trim() })
    );
  }
}
