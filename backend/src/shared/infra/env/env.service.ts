import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

/**
 * Environment Configuration Service
 * Wraps NestJS ConfigService with typed methods
 */
@Injectable()
export class EnvService {
  constructor(private configService: NestConfigService) {}

  get(key: string): string {
    return this.configService.get<string>(key) ?? '';
  }

  getNumber(key: string): number {
    return Number(this.configService.get<string>(key) ?? 0);
  }

  getBoolean(key: string): boolean {
    return this.configService.get<string>(key) === 'true';
  }

  // Specific environment getters
  get nodeEnv(): string {
    return this.get('NODE_ENV') || 'development';
  }

  get port(): number {
    return this.getNumber('PORT') || 3000;
  }

  get databaseUrl(): string {
    return this.get('DATABASE_URL');
  }

  get jwtSecret(): string {
    return this.get('JWT_SECRET');
  }

  get jwtExpiresIn(): string {
    return this.get('JWT_EXPIRES_IN') || '7d';
  }

  get redisUrl(): string {
    return this.get('REDIS_URL');
  }

  // Payment Gateway Configuration
  get asaasApiKey(): string {
    return this.get('ASAAS_API_KEY');
  }

  get asaasEnvironment(): string {
    return this.get('ASAAS_ENVIRONMENT') || 'sandbox';
  }

  get asaasWebhookSecret(): string {
    return this.get('ASAAS_WEBHOOK_SECRET');
  }
}
