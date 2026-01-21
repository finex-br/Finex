import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyController } from './presentation/controllers/company.controller';
import { JwtAuthGuard } from '../authentication/presentation/http/guards/jwt-auth.guard';
import { UserSchema } from '../authentication/infrastructure/persistence/typeorm/entities/user.schema';
import { EnvService } from '../../shared/infra/env';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSchema]),
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
  controllers: [CompanyController],
  providers: [JwtAuthGuard],
})
export class CompanyModule {}
