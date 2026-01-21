import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import axios from 'axios';
import { UserSchema } from './persistence/typeorm/entities/user.schema';
import { SocialAccountSchema } from './persistence/typeorm/schemas/social-account.schema';
import { CompanySchema } from '../../../shared/infra/database/typeorm/entities/company.schema';
import { CompanyMemberSchema } from '../../../shared/infra/database/typeorm/entities/company-member.schema';
import { UserRepository } from './persistence/typeorm/repositories/user.repository';
import { SocialAccountRepository } from './persistence/typeorm/social-account.repository';
import { CompanyRepository } from '../../../shared/infra/database/typeorm/repositories/company.repository';
import { CompanyMemberRepository } from '../../../shared/infra/database/typeorm/repositories/company-member.repository';
import { JwtTokenService } from './adapters/jwt-token.service';
import { SignUpUseCase } from '../application/use-cases/sign-up.use-case';
import { SignInUseCase } from '../application/use-cases/sign-in.use-case';
import { AuthenticateWithSocialUseCase } from '../application/use-cases/authenticate-with-social.use-case';
import { LinkSocialAccountUseCase } from '../application/use-cases/link-social-account.use-case';
import { UnlinkSocialAccountUseCase } from '../application/use-cases/unlink-social-account.use-case';
import { AuthController } from '../presentation/http/controllers/auth.controller';
import { OAuthController } from '../presentation/http/controllers/oauth.controller';
import { SocialAccountController } from '../presentation/http/controllers/social-account.controller';
// DISABLED: Google OAuth
// import { GoogleOAuthProvider } from './oauth/google-oauth.provider';
import { GitHubOAuthProvider } from './oauth/github-oauth.provider';
import { FacebookOAuthProvider } from './oauth/facebook-oauth.provider';
import { OAuthProviderFactory } from './oauth/oauth-provider.factory';
import { EnvService } from '../../../shared/infra/env';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSchema, SocialAccountSchema, CompanySchema, CompanyMemberSchema]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        secret: envService.jwtSecret,
        signOptions: {
          expiresIn: envService.jwtExpiresIn as any,
        },
      }),
    }),
  ],
  controllers: [AuthController, OAuthController, SocialAccountController],
  providers: [
    UserRepository,
    SocialAccountRepository,
    CompanyRepository,
    CompanyMemberRepository,
    JwtTokenService,
    // DISABLED: Google OAuth Provider
    // {
    //   provide: 'GOOGLE_OAUTH_PROVIDER',
    //   useFactory: (envService: EnvService) => {
    //     const httpClient = {
    //       post: async (url: string, data: any) => axios.post(url, data),
    //       get: async (url: string, config?: any) => axios.get(url, config),
    //     };
    //     return new GoogleOAuthProvider(
    //       httpClient,
    //       envService.get('GOOGLE_CLIENT_ID') || '',
    //       envService.get('GOOGLE_CLIENT_SECRET') || '',
    //     );
    //   },
    //   inject: [EnvService],
    // },
    // ALL OAUTH PROVIDERS DISABLED - Only email/password login active
    // {
    //   provide: 'GITHUB_OAUTH_PROVIDER',
    //   useFactory: (envService: EnvService) => {
    //     const httpClient = {
    //       post: async (url: string, data: any) => axios.post(url, data),
    //       get: async (url: string, config?: any) => axios.get(url, config),
    //     };
    //     return new GitHubOAuthProvider(
    //       httpClient,
    //       envService.get('GITHUB_CLIENT_ID') || '',
    //       envService.get('GITHUB_CLIENT_SECRET') || '',
    //     );
    //   },
    //   inject: [EnvService],
    // },
    // {
    //   provide: 'FACEBOOK_OAUTH_PROVIDER',
      useFactory: (envService: EnvService) => {
        const httpClient = {
          post: async (url: string, data: any) => axios.post(url, data),
          get: async (url: string, config?: any) => axios.get(url, config),
        };
        return new FacebookOAuthProvider(
          httpClient,
          envService.get('FACEBOOK_CLIENT_ID') || '',
          envService.get('FACEBOOK_CLIENT_SECRET') || '',
        );
      },
      inject: [EnvService],
    },
    OAuthProviderFactory,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'ISocialAccountRepository',
      useClass: SocialAccountRepository,
    },
    {
      provide: 'ITokenService',
      useClass: JwtTokenService,
    },
    {
      provide: SignUpUseCase,
      useFactory: (
        userRepo: UserRepository,
        tokenService: JwtTokenService,
        companyRepo: CompanyRepository,
        companyMemberRepo: CompanyMemberRepository,
      ) => {
        return new SignUpUseCase(userRepo, tokenService, companyRepo, companyMemberRepo);
      },
      inject: [UserRepository, JwtTokenService, CompanyRepository, CompanyMemberRepository],
    },
    {
      provide: SignInUseCase,
      useFactory: (userRepo: UserRepository, tokenService: JwtTokenService) => {
        return new SignInUseCase(userRepo, tokenService);
      },
      inject: [UserRepository, JwtTokenService],
    },
    // ALL OAUTH USE CASES DISABLED
    // {
    //   provide: AuthenticateWithSocialUseCase,
    //   useFactory: (
    //     userRepo: UserRepository,
    //     socialAccountRepo: SocialAccountRepository,
    //     googleProvider: any,
    //     tokenService: JwtTokenService,
    //   ) => {
    //     return new AuthenticateWithSocialUseCase(
    //       userRepo,
    //       socialAccountRepo,
    //       googleProvider,
    //       tokenService,
    //     );
    //   },
    //   inject: [
    //     UserRepository,
    //     SocialAccountRepository,
    //     'GOOGLE_OAUTH_PROVIDER',
    //     JwtTokenService,
    //   ],
    // },
    // {
    //   provide: LinkSocialAccountUseCase,
    //   useFactory: (
    //     userRepo: UserRepository,
    //     socialAccountRepo: SocialAccountRepository,
    //     googleProvider: any,
    //   ) => {
    //     return new LinkSocialAccountUseCase(
    //       userRepo,
    //       socialAccountRepo,
    //       googleProvider,
    //     );
    //   },
    //   inject: [
    //     UserRepository,
    //     SocialAccountRepository,
    //     'GOOGLE_OAUTH_PROVIDER',
    //   ],
    // },
    {
      provide: UnlinkSocialAccountUseCase,
      useFactory: (
        userRepo: UserRepository,
        socialAccountRepo: SocialAccountRepository,
      ) => {
        return new UnlinkSocialAccountUseCase(userRepo, socialAccountRepo);
      },
      inject: [UserRepository, SocialAccountRepository],
    },
  ],
  exports: [UserRepository, SocialAccountRepository, JwtTokenService],
})
export class AuthenticationModule {}
