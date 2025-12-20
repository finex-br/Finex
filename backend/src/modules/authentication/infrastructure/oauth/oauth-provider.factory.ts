import { Injectable, Inject } from '@nestjs/common';
import { IOAuthProvider } from '../../application/ports/oauth-provider.interface';
import { SocialProvider } from '../../domain/value-objects/social-provider';

@Injectable()
export class OAuthProviderFactory {
  private readonly providers: Map<string, IOAuthProvider>;

  constructor(
    @Inject('GOOGLE_OAUTH_PROVIDER')
    googleProvider: IOAuthProvider,
    @Inject('GITHUB_OAUTH_PROVIDER')
    githubProvider: IOAuthProvider,
    @Inject('FACEBOOK_OAUTH_PROVIDER')
    facebookProvider: IOAuthProvider,
  ) {
    this.providers = new Map([
      ['GOOGLE', googleProvider],
      ['GITHUB', githubProvider],
      ['FACEBOOK', facebookProvider],
    ]);
  }

  getProvider(provider: SocialProvider): IOAuthProvider {
    const oauthProvider = this.providers.get(provider.value);
    if (!oauthProvider) {
      throw new Error(`OAuth provider ${provider.value} not found`);
    }
    return oauthProvider;
  }
}
