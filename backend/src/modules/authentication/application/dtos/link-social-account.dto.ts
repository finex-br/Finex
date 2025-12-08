export class LinkSocialAccountDto {
  userId: string;
  provider: string;
  code: string;
  redirectUri?: string;
}
