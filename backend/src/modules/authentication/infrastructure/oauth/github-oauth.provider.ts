import { Injectable } from '@nestjs/common';
import { IOAuthProvider } from '../../application/ports/oauth-provider.interface';
import { SocialProfileDto } from '../../application/dtos/social-profile.dto';

interface HttpClient {
  post(url: string, data: any, config?: any): Promise<any>;
  get(url: string, config?: any): Promise<any>;
}

@Injectable()
export class GitHubOAuthProvider implements IOAuthProvider {
  private readonly tokenUrl = 'https://github.com/login/oauth/access_token';
  private readonly profileUrl = 'https://api.github.com/user';

  constructor(
    private readonly httpClient: HttpClient,
    private readonly clientId: string,
    private readonly clientSecret: string,
  ) {}

  getProvider(): string {
    return 'GITHUB';
  }

  async exchangeCodeForProfile(
    code: string,
    redirectUri?: string,
  ): Promise<SocialProfileDto> {
    try {
      // Exchange code for access token
      const tokenResponse = await this.httpClient.post(
        this.tokenUrl,
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: redirectUri,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );

      const accessToken = tokenResponse.data.access_token;

      // Get user profile
      const profileResponse = await this.httpClient.get(this.profileUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      const profile = profileResponse.data;

      return {
        id: String(profile.id),
        email: profile.email,
        displayName: profile.name || profile.login,
        avatarUrl: profile.avatar_url,
        provider: 'GITHUB',
      };
    } catch (error) {
      throw error;
    }
  }
}
