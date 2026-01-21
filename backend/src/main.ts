import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { EnvService } from './shared/infra/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get environment service
  const envService = app.get(EnvService);
  const port = envService.port;

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS with production configuration
  const corsOrigins = envService.nodeEnv === 'production'
    ? [envService.get('FRONTEND_URL'), envService.get('API_URL')]
    : true;

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Company-Id',
      'x-company-id',
    ],
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('FinEx API')
    .setDescription('FinEx Backend API - OAuth 2.0 Authentication System')
    .setVersion('1.0')
    .addTag('OAuth', 'OAuth 2.0 authentication endpoints')
    .addTag('Social Account', 'Social account management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
