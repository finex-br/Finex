import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserSchema } from './persistence/typeorm/entities/user.schema';
import { SocialAccountSchema } from './persistence/typeorm/schemas/social-account.schema';
import { UserRepository } from './persistence/typeorm/repositories/user.repository';
import { SocialAccountRepository } from './persistence/typeorm/social-account.repository';
import { JwtTokenService } from './adapters/jwt-token.service';
import { SignUpUseCase } from '../application/use-cases/sign-up.use-case';
import { SignInUseCase } from '../application/use-cases/sign-in.use-case';
import { AuthenticateWithSocialUseCase } from '../application/use-cases/authenticate-with-social.use-case';
import { LinkSocialAccountUseCase } from '../application/use-cases/link-social-account.use-case';
import { UnlinkSocialAccountUseCase } from '../application/use-cases/unlink-social-account.use-case';
import { AuthController } from '../presentation/http/controllers/auth.controller';
import { OAuthController } from '../presentation/http/controllers/oauth.controller';
import { SocialAccountController } from '../presentation/http/controllers/social-account.controller';
import { GoogleOAuthProvider } from './oauth/google-oauth.provider';
import { GitHubOAuthProvider } from './oauth/github-oauth.provider';
import { AppleOAuthProvider } from './oauth/apple-oauth.provider';
import { FacebookOAuthProvider } from './oauth/facebook-oauth.provider';
import { OAuthProviderFactory } from './oauth/oauth-provider.factory';
import { EnvService } from '../../../shared/infra/env';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSchema, SocialAccountSchema]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        secret: envService.jwtSecret,
        signOptions: {
          expiresIn: envService.jwtExpiresIn,
        },
      }),
    }),
  ],
  controllers: [AuthController, OAuthController, SocialAccountController],
  providers: [
    UserRepository,
    SocialAccountRepository,
    JwtTokenService,
    {
      provide: 'GOOGLE_OAUTH_PROVIDER',
      useFactory: (envService: EnvService) => {
        // TODO: Implement proper HTTP client
        const httpClient = {
          post: async () => ({}),
          get: async () => ({}),
        };
        return new GoogleOAuthProvider(
          httpClient,
          envService.get('GOOGLE_CLIENT_ID') || '',
          envService.get('GOOGLE_CLIENT_SECRET') || '',
        );
      },
      inject: [EnvService],
    },
    {
      provide: 'GITHUB_OAUTH_PROVIDER',
      useFactory: (envService: EnvService) => {
        const httpClient = {
          post: async () => ({}),
          get: async () => ({}),
        };
        return new GitHubOAuthProvider(
          httpClient,
          envService.get('GITHUB_CLIENT_ID') || '',
          envService.get('GITHUB_CLIENT_SECRET') || '',
        );
      },
      inject: [EnvService],
    },
    {
      provide: 'APPLE_OAUTH_PROVIDER',
      useFactory: (envService: EnvService) => {
        const httpClient = {
          post: async () => ({}),
          get: async () => ({}),
        };
        return new AppleOAuthProvider(
          httpClient,
          envService.get('APPLE_CLIENT_ID') || '',
          envService.get('APPLE_TEAM_ID') || '',
          envService.get('APPLE_KEY_ID') || '',
          envService.get('APPLE_PRIVATE_KEY') || '',
        );
      },
      inject: [EnvService],
    },
    {
      provide: 'FACEBOOK_OAUTH_PROVIDER',
      useFactory: (envService: EnvService) => {
        const httpClient = {
          post: async () => ({}),
          get: async () => ({}),
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
      useFactory: (userRepository: UserRepository, tokenService: JwtTokenService) => {
        return new SignUpUseCase(userRepository, tokenService);
      },
      inject: [UserRepository, JwtTokenService],
    },
    {
      provide: SignInUseCase,
      useFactory: (userRepository: UserRepository, tokenService: JwtTokenService) => {
        return new SignInUseCase(userRepository, tokenService);
      },
      inject: [UserRepository, JwtTokenService],
    },
    AuthenticateWithSocialUseCase,
    LinkSocialAccountUseCase,
    UnlinkSocialAccountUseCase,
  ],
  exports: [UserRepository, SocialAccountRepository, JwtTokenService],
})
export class AuthenticationModule {}
