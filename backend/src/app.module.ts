import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvModule, EnvService } from './shared/infra/env';
import { AuthenticationModule } from './modules/authentication/infrastructure/authentication.module';

@Module({
  imports: [
    EnvModule,
    TypeOrmModule.forRootAsync({
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        type: 'postgres',
        url: envService.databaseUrl,
        entities: [__dirname + '/**/*.schema{.ts,.js}'],
        synchronize: envService.nodeEnv === 'development',
        logging: envService.nodeEnv === 'development',
      }),
    }),
    AuthenticationModule,
  ],
})
export class AppModule {}
