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
        type: 'postgres', // Change to DuckDB when driver is available
        url: envService.databaseUrl,
        autoLoadEntities: true,
        synchronize: envService.nodeEnv === 'development',
      }),
    }),
    AuthenticationModule,
  ],
})
export class AppModule {}
