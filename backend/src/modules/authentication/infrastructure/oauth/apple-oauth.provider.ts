import { Injectable } from '@nestjs/common';
import { IOAuthProvider } from '../../application/ports/oauth-provider.interface';
import { SocialProfileDto } from '../../application/dtos/social-profile.dto';

interface HttpClient {
  post(url: string, data: any, config?: any): Promise<any>;
  get(url: string, config?: any): Promise<any>;
}

interface AppleUserInfo {
  name?: {
    firstName?: string;
    lastName?: string;
  };
}

@Injectable()
export class AppleOAuthProvider implements IOAuthProvider {
  private readonly tokenUrl = 'https://appleid.apple.com/auth/token';

  constructor(
    private readonly httpClient: HttpClient,
    private readonly clientId: string,
    private readonly teamId: string,
    private readonly keyId: string,
    private readonly privateKey: string,
  ) {}

  getProvider(): string {
    return 'APPLE';
  }

  async exchangeCodeForProfile(
    code: string,
    redirectUri?: string,
    userInfo?: AppleUserInfo,
  ): Promise<SocialProfileDto> {
    try {
      // Generate client secret (JWT)
      const clientSecret = this.generateClientSecret();

      // Exchange code for tokens
      const tokenResponse = await this.httpClient.post(
        this.tokenUrl,
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri || '',
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const { id_token } = tokenResponse.data;

      if (!id_token) {
        throw new Error('No id_token received from Apple');
      }

      // Decode id_token (JWT)
      const decodedToken = this.decodeIdToken(id_token);

      // Build display name
      let displayName = decodedToken.email;
      if (userInfo?.name?.firstName || userInfo?.name?.lastName) {
        displayName = [userInfo.name.firstName, userInfo.name.lastName]
          .filter(Boolean)
          .join(' ');
      }

      return {
        id: decodedToken.sub,
        email: decodedToken.email,
        displayName,
        provider: 'APPLE',
      };
    } catch (error) {
      throw error;
    }
  }

  private generateClientSecret(): string {
    // In a real implementation, this would generate a JWT signed with the private key
    // For now, we'll return a placeholder
    // TODO: Implement proper JWT generation with private key
    return 'generated-client-secret';
  }

  private decodeIdToken(idToken: string): any {
    // Simple JWT decode (payload only, no verification for now)
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  }
}
