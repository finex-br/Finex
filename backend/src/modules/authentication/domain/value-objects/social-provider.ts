import { Result } from '../../../../shared/core/result';
import { ValueObject } from '../../../../shared/core/value-object';

export enum SocialProviderEnum {
  // ALL OAUTH PROVIDERS DISABLED - Only email/password login active
  // Keeping enum structure for backward compatibility but no active providers
}

interface SocialProviderProps {
  value: string;
}

export class SocialProvider extends ValueObject<SocialProviderProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: SocialProviderProps) {
    super(props);
  }

  public static create(provider: string): Result<SocialProvider> {
    // ALL OAUTH PROVIDERS DISABLED - Only email/password login active
    return Result.fail<SocialProvider>(
      'OAuth authentication is currently disabled. Please use email/password login.'
    );
  }

  // ALL OAUTH METHODS DISABLED
  // public isGoogle(): boolean {
  //   return this.props.value === 'GOOGLE';
  // }

  // public isGitHub(): boolean {
  //   return this.props.value === 'GITHUB';
  // }

  // public isFacebook(): boolean {
  //   return this.props.value === 'FACEBOOK';
  // }
}
