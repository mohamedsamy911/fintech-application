import { Module } from '@nestjs/common';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

/**
 * The root module of the application.
 * It imports all feature modules and sets up shared configurations.
 */
@Module({
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
      synchronize: true,  // Turn this off in production
      autoLoadEntities: true,
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
export class AppModule { }
