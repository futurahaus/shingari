import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as compression from 'compression';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// Load environment variables before anything else
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const logger = new Logger('Bootstrap');

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Shingari API')
    .setDescription('Documentación de la API del proyecto Shingari')
    .setVersion('1.0')
    // .addTag('auth') // Puedes añadir tags para agrupar endpoints
    // .addTag('user')
    .addServer('/api')
    .addBearerAuth() // Si usas autenticación Bearer (JWT)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // La UI estará en /api-docs

  // Security middleware
  app.use(helmet()); // Adds various HTTP headers for security
  app.use(compression()); // Compress responses

  // Configure CORS for frontend
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://shingarifoods.es',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600, // Cache preflight requests for 1 hour
  });

  app.use(cookieParser());

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

  app.setGlobalPrefix('api');
  await app.listen(port);
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(
    `Swagger documentation is available at: ${await app.getUrl()}/api-docs`,
  );
}
bootstrap();
