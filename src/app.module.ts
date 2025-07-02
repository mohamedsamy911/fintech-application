import { Module } from '@nestjs/common';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

/**
 * AppModule
 *
 * This is the root module of the application.
 * It imports and configures:
 * - Environment config via `ConfigModule`
 * - Database connection via `TypeOrmModule`
 * - Rate limiting via `ThrottlerModule`
 * - Business feature modules (`AccountsModule` and `TransactionsModule`)
 */
@Module({
  /**
   * Registers the `ThrottlerGuard` globally using `APP_GUARD`.
   *
   * This enforces rate limiting for all incoming requests automatically.
   * If specific routes need custom limits, use the `@Throttle()` decorator in controllers.
   */
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  imports: [
    /**
     * Loads environment variables from a `.env` file or the process environment.
     * Makes variables like DB credentials available via `process.env`.
     *
     * @credit Based on official NestJS `ConfigModule` best practices.
     */
    ConfigModule.forRoot(),

    /**
     * Establishes a connection to the PostgreSQL database using TypeORM.
     *
     * Configuration values are loaded from environment variables using `process.env`.
     *
     * `synchronize: true` auto-generates schema — useful for development,
     * but should be disabled in production to avoid data loss.
     *
     * `autoLoadEntities: true` automatically loads all entities defined in feature modules.
     */
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true, // Turn this off in production
      autoLoadEntities: true,
    }),

    /**
     * Sets up the global rate limiting mechanism using `@nestjs/throttler`.
     *
     * Config:
     * - `ttl`: 60000ms (1 minute window)
     * - `limit`: max 10 requests per IP within that window
     *
     * This helps mitigate brute force and DoS attacks by restricting request rate.
     *
     * @example By default, users can only send 10 requests/minute per IP.
     * Use `@Throttle(limit, ttl)` in controllers to override per-route limits.
     */
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),

    /**
     * Business domain module for user account creation and balance inquiry.
     */
    AccountsModule,

    /**
     * Business domain module for handling deposit and withdrawal transactions.
     */
    TransactionsModule,
  ],
})
export class AppModule {}
