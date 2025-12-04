import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserSchema } from './persistence/typeorm/entities/user.schema';
import { UserRepository } from './persistence/typeorm/repositories/user.repository';
import { JwtTokenService } from './adapters/jwt-token.service';
import { SignUpUseCase } from '../application/use-cases/sign-up.use-case';
import { SignInUseCase } from '../application/use-cases/sign-in.use-case';
import { AuthController } from '../presentation/http/controllers/auth.controller';
import { EnvService } from '../../../shared/infra/env';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSchema]),
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
  controllers: [AuthController],
  providers: [
    UserRepository,
    JwtTokenService,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'ITokenService',
      useClass: JwtTokenService,
    },
    {
      provide: SignUpUseCase,
      useFactory: (userRepo: UserRepository, tokenService: JwtTokenService) => {
        return new SignUpUseCase(userRepo, tokenService);
      },
      inject: [UserRepository, JwtTokenService],
    },
    {
      provide: SignInUseCase,
      useFactory: (userRepo: UserRepository, tokenService: JwtTokenService) => {
        return new SignInUseCase(userRepo, tokenService);
      },
      inject: [UserRepository, JwtTokenService],
    },
  ],
  exports: [UserRepository, JwtTokenService],
})
export class AuthenticationModule {}
