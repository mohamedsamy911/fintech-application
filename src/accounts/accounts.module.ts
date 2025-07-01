import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/accounts.entity';

/**
 * AccountsModule
 *
 * Encapsulates all logic related to user accounts.
 * Responsibilities include:
 * - Creating new accounts
 * - Fetching account balances
 * - Connecting to the Account entity via TypeORM
 */
@Module({
   /**
   * Registers the Account entity for use with TypeORM.
   * Makes the repository available for injection in the AccountsService.
   */
  imports: [TypeOrmModule.forFeature([Account])],

   /**
   * The service responsible for implementing account business logic:
   * - Account creation
   * - Balance checks
   */
  providers: [AccountsService],

  /**
   * The controller that handles HTTP routes for:
   * - POST /accounts
   * - GET /accounts/:id
   */
  controllers: [AccountsController]
})
export class AccountsModule { }
