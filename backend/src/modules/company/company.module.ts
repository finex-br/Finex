import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CompanyController } from './presentation/controllers/company.controller';
import { JwtAuthGuard } from '../authentication/presentation/http/guards/jwt-auth.guard';
import { EnvService } from '../../shared/infra/env';

@Module({
  imports: [
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
