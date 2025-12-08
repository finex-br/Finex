import { SocialProfileDto } from '../dtos/social-profile.dto';

export interface IOAuthProvider {
  exchangeCodeForProfile(code: string, redirectUri?: string): Promise<SocialProfileDto>;
  getProvider(): string;
}
