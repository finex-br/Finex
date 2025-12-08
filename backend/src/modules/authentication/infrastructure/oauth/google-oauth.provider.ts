import { Injectable } from '@nestjs/common';
import { IOAuthProvider } from '../../application/ports/oauth-provider.interface';
import { SocialProfileDto } from '../../application/dtos/social-profile.dto';

interface HttpClient {
  post(url: string, data: any, config?: any): Promise<any>;
  get(url: string, config?: any): Promise<any>;
}

@Injectable()
export class GoogleOAuthProvider implements IOAuthProvider {
  private readonly tokenUrl = 'https://oauth2.googleapis.com/token';
  private readonly profileUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';

  constructor(
    private readonly httpClient: HttpClient,
    private readonly clientId: string,
    private readonly clientSecret: string,
  ) {}

  getProvider(): string {
    return 'GOOGLE';
  }

  async exchangeCodeForProfile(
    code: string,
    redirectUri?: string,
  ): Promise<SocialProfileDto> {
    try {
      // Exchange code for access token
      const tokenResponse = await this.httpClient.post(this.tokenUrl, {
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });

      const accessToken = tokenResponse.data.access_token;

      // Get user profile
      const profileResponse = await this.httpClient.get(this.profileUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const profile = profileResponse.data;

      return {
        id: profile.id,
        email: profile.email,
        displayName: profile.name,
        avatarUrl: profile.picture,
        provider: 'GOOGLE',
      };
    } catch (error) {
      throw error;
    }
  }
}
