import {
    BadRequestException,
    HttpException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Transaction } from './entities/transactions.entity';
import { Account } from '../accounts/entities/accounts.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';

/**
 * Enum representing transaction types.
 */
export enum TransactionType {
    DEPOSIT = 'DEPOSIT',
    WITHDRAWAL = 'WITHDRAWAL',
}

/**
 * Service responsible for handling business logic related to account transactions.
 * Includes creation of new transactions and retrieval of account transaction history.
 */
@Injectable()
export class TransactionsService {
    private readonly logger = new Logger(TransactionsService.name);
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionsRepository: Repository<Transaction>,
    ) { }

    /**
     * Creates a new transaction (deposit or withdrawal) for a specific account.
     *
     * Handles:
     * - Validation of positive amount
     * - Account lookup with pessimistic lock (to avoid race conditions)
     * - Sufficient balance check for withdrawals
     * - Atomic update via TypeORM transaction manager
     *
     * @param createTransactionDto - incoming transaction payload
     * @returns the created Transaction
     * @throws BadRequestException if amount is negative or insufficient funds for withdrawal
     * @throws NotFoundException if account not found
     * @throws InternalServerErrorException if transaction processing fails
     *
     * @credit Implementation logic inspired by classic banking systems where account state consistency is critical.
     */

    public async createTransaction(
        createTransactionDto: CreateTransactionDto,
    ): Promise<Transaction> {
        const { accountId, amount, type } = createTransactionDto;

        // Amount must be positive
        if (amount <= 0) {
            this.logger.error(`Invalid transaction amount: ${amount}`);
            throw new BadRequestException('Amount must be positive');
        }

        // Execute inside a DB transaction to maintain consistency
        return await this.transactionsRepository.manager.transaction(
            async (manager: EntityManager) => {
                try {
                    // Use pessimistic locking to prevent concurrent updates
                    const account = await manager.findOne(Account, {
                        where: { id: accountId },
                        lock: { mode: 'pessimistic_write' },
                    });

                    if (!account) {
                        this.logger.error(`Account not found: ${accountId}`);
                        throw new NotFoundException('Account not found');
                    }

                    // Check for sufficient funds on withdrawal
                    if (type === TransactionType.WITHDRAWAL && account.balance < amount) {
                        this.logger.error(
                            `Insufficient funds for account ${accountId}: balance ${account.balance}, withdrawal amount ${amount}`,
                        );
                        throw new BadRequestException('Insufficient funds');
                    }

                    // Update balance based on transaction type
                    account.balance =
                        type === TransactionType.WITHDRAWAL
                            ? Number(account.balance) - amount
                            : Number(account.balance) + amount;

                    await manager.save(account);

                    // Create transaction record
                    const transaction = manager.create(Transaction, {
                        accountId,
                        amount,
                        type,
                    });

                    this.logger.log(
                        `${type} transaction created for account ${accountId}: amount ${amount}, new balance ${account.balance}`,
                    );

                    return await manager.save(transaction);
                } catch (error) {
                    // Re-throw known HTTP exceptions
                    if (error instanceof HttpException) throw error;

                    this.logger.error('Unexpected error during transaction', error);
                    throw new InternalServerErrorException(
                        'Transaction processing failed',
                    );
                }
            },
        );
    }

    /**
     * Retrieves all transactions for a specific account, ordered by most recent.
     *
     * @param accountId - account ID to look up transactions for
     * @returns a list of Transaction entities
     * @throws NotFoundException if account has no transactions
     * @throws InternalServerErrorException if retrieval fails
     */
    public async getTransactions(accountId: string): Promise<Transaction[]> {
        try {
            const transaction = await this.transactionsRepository.find({
                where: { accountId },
                order: { createdAt: 'DESC' },
            });
            if (!transaction || transaction.length === 0) {
                this.logger.error(`Transaction not found for account: ${accountId}`);
                throw new NotFoundException(`Account ${accountId} has no transactions`);
            }
            return transaction;
        } catch (error) {
            this.logger.error('Failed to retrieve transaction', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Transaction retrieval failed');
        }
    }
}
