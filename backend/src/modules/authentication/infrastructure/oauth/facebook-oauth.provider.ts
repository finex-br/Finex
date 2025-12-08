import { Injectable } from '@nestjs/common';
import { IOAuthProvider } from '../../application/ports/oauth-provider.interface';
import { SocialProfileDto } from '../../application/dtos/social-profile.dto';

interface HttpClient {
  post(url: string, data: any, config?: any): Promise<any>;
  get(url: string, config?: any): Promise<any>;
}

@Injectable()
export class FacebookOAuthProvider implements IOAuthProvider {
  private readonly tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
  private readonly profileUrl = 'https://graph.facebook.com/me';

  constructor(
    private readonly httpClient: HttpClient,
    private readonly clientId: string,
    private readonly clientSecret: string,
  ) {}

  getProvider(): string {
    return 'FACEBOOK';
  }

  async exchangeCodeForProfile(
    code: string,
    redirectUri?: string,
  ): Promise<SocialProfileDto> {
    try {
      // Exchange code for access token
      const tokenResponse = await this.httpClient.get(this.tokenUrl, {
        params: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: redirectUri,
          code,
        },
      });

      const accessToken = tokenResponse.data.access_token;

      // Get user profile
      const profileResponse = await this.httpClient.get(this.profileUrl, {
        params: {
          fields: 'id,email,name,picture',
          access_token: accessToken,
        },
      });

      const profile = profileResponse.data;

      return {
        id: profile.id,
        email: profile.email,
        displayName: profile.name,
        avatarUrl: profile.picture?.data?.url,
        provider: 'FACEBOOK',
      };
    } catch (error) {
      throw error;
    }
  }
}
