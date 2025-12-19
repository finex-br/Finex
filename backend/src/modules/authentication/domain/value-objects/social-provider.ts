import { Result } from '../../../../shared/core/result';
import { ValueObject } from '../../../../shared/core/value-object';

export enum SocialProviderEnum {
  GOOGLE = 'GOOGLE',
  GITHUB = 'GITHUB',
  FACEBOOK = 'FACEBOOK',
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
    if (!provider || provider.trim().length === 0) {
      return Result.fail<SocialProvider>('Social provider is required');
    }

    const normalizedProvider = provider.trim().toUpperCase();

    if (!Object.values(SocialProviderEnum).includes(normalizedProvider as SocialProviderEnum)) {
      return Result.fail<SocialProvider>(
        `Invalid social provider. Valid providers: ${Object.values(SocialProviderEnum).join(', ')}`
      );
    }

    return Result.ok<SocialProvider>(
      new SocialProvider({ value: normalizedProvider })
    );
  }

  public isGoogle(): boolean {
    return this.props.value === SocialProviderEnum.GOOGLE;
  }

  public isGitHub(): boolean {
    return this.props.value === SocialProviderEnum.GITHUB;
  }

  public isFacebook(): boolean {
    return this.props.value === SocialProviderEnum.FACEBOOK;
  }
}
