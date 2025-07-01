import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transactions.entity';

/**
 * TransactionsModule
 *
 * Encapsulates all logic related to handling transactions (DEPOSIT/WITHDRAWAL).
 * This includes:
 * - The controller responsible for handling HTTP requests
 * - The service containing business logic and database interaction
 * - The entity representing a transaction in the database
 */
@Module({
  /**
  * Registers the Transaction entity with TypeORM for dependency injection.
  * This allows the TransactionsService to access the transaction repository.
  */
  imports: [TypeOrmModule.forFeature([Transaction])],

  /**
   * The service provider that contains core logic such as:
   * - Creating transactions
   * - Performing balance updates with pessimistic locking
   * - Validating transaction rules
   */
  providers: [TransactionsService],

  /**
   * The controller responsible for exposing transaction APIs such as:
   * - POST /transactions
   * - GET /transactions/:accountId
   */
  controllers: [TransactionsController]
})
export class TransactionsModule { }
