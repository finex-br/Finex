import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { SentryModule as SentryNestModule, SentryGlobalFilter } from '@sentry/nestjs/setup';
import { SentryUserInterceptor } from './sentry-user.interceptor';

@Module({
  imports: [SentryNestModule.forRoot()],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryUserInterceptor,
    },
  ],
})
export class SentryConfigModule {}
