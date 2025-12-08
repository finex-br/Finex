export class AuthenticateWithSocialDto {
  provider: string;
  code: string;
  redirectUri?: string;
}
