// ─────────────────────────────────────────────────────────────────────────────
// Application Entry Point
// ─────────────────────────────────────────────────────────────────────────────
// Boots the NestJS application with:
//   • Swagger UI            — interactive API docs at /api/docs
//   • Global validation pipe — rejects malformed requests automatically
//   • CORS                   — enabled for frontend dev server
//   • Global prefix          — all routes start with /api
//   • Graceful shutdown hooks — ensures DB connections close cleanly
// ─────────────────────────────────────────────────────────────────────────────

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // ── Global API Prefix ───────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── Swagger / OpenAPI ───────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Enterprise HR Management System')
    .setDescription(
      'Production-ready REST API for HR Management — ' +
      'Auth, Employees, Departments, Leave, Assets, Performance, and more.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-Auth',
    )
    .addTag('auth', 'Authentication & Authorization')
    .addTag('employees', 'Employee Management')
    .addTag('departments', 'Department Management')
    .addTag('job-titles', 'Job Title / Position Management')
    .addTag('leave-requests', 'Leave / Absence Management')
    .addTag('assets', 'Company Asset Tracking')
    .addTag('performance-reviews', '360° Performance Appraisal')
    .addTag('exit-checklists', 'Offboarding Checklist Management')
    .addTag('job-histories', 'Promotion & Transfer History')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Keep JWT token across page reloads
      docExpansion: 'list',
      filter: true,
    },
  });

  // ── Validation Pipe ─────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── CORS ────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3001',
    credentials: true,
  });

  // ── Graceful Shutdown ───────────────────────────────────────────────────
  app.enableShutdownHooks();

  // ── Start ───────────────────────────────────────────────────────────────
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`🚀 Server running on http://localhost:${port}/api`);
  logger.log(`📚 Swagger UI available at http://localhost:${port}/api/docs`);
}

bootstrap();
