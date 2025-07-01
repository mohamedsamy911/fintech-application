import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

/**
 * Bootstrap function for initializing the NestJS application.
 * Applies global configurations such as:
 * - CORS policy
 * - ValidationPipe for DTO enforcement
 * - Swagger API documentation
 * - Global exception handling
 */
async function bootstrap() {
  // Create the NestJS application using the root AppModule
  const app = await NestFactory.create(AppModule);

  /**
   * Enable Cross-Origin Resource Sharing (CORS) for all origins.
   * This is useful for development or exposing a public API.
   * In production, consider restricting to allowed domains.
   */
  app.enableCors({
    origin: '*',
    methods: 'GET,POST',
    credentials: true,
  });

  /**
   * Apply global validation rules using class-validator + class-transformer.
   * - `whitelist`: strips out non-decorated properties
   * - `forbidNonWhitelisted`: throws if extra props exist
   * - `transform`: automatically transforms input types
   *
   * @credit Standard NestJS best practice for safe DTO handling
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /**
   * Swagger setup for live API documentation.
   * The documentation will be available at `/api`.
   * 
   * To access: http://localhost:3000/api
   */
  const config = new DocumentBuilder()
    .setTitle('Fintech API')
    .setDescription('The fintech API description')
    .setVersion('1.0')
    .build();

  // Create the Swagger document and bind it to the `/api` route
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  /**
   * Register the global exception filter to catch unhandled errors
   * and return a consistent response structure.
   */
  app.useGlobalFilters(new GlobalExceptionFilter());

  /**
   * Start listening on the configured port.
   * Falls back to 3000 if `PORT` is not defined.
   */
  await app.listen(process.env.PORT ?? 3000);
}

// Entry point for the application
bootstrap();
