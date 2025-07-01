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

export enum TransactionType {
    DEPOSIT = 'DEPOSIT',
    WITHDRAWAL = 'WITHDRAWAL',
}

@Injectable()
export class TransactionsService {
    private readonly logger = new Logger(TransactionsService.name);
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionsRepository: Repository<Transaction>,
    ) { }

    public async createTransaction(
        createTransactionDto: CreateTransactionDto,
    ): Promise<Transaction> {
        const { accountId, amount, type } = createTransactionDto;

        if (amount <= 0) {
            this.logger.error(`Invalid transaction amount: ${amount}`);
            throw new BadRequestException('Amount must be positive');
        }

        return await this.transactionsRepository.manager.transaction(
            async (manager: EntityManager) => {
                try {
                    const account = await manager.findOne(Account, {
                        where: { id: accountId },
                        lock: { mode: 'pessimistic_write' },
                    });

                    if (!account) {
                        this.logger.error(`Account not found: ${accountId}`);
                        throw new NotFoundException('Account not found');
                    }

                    if (type === TransactionType.WITHDRAWAL && account.balance < amount) {
                        this.logger.error(
                            `Insufficient funds for account ${accountId}: balance ${account.balance}, withdrawal amount ${amount}`,
                        );
                        throw new BadRequestException('Insufficient funds');
                    }

                    account.balance =
                        type === TransactionType.WITHDRAWAL
                            ? Number(account.balance) - amount
                            : Number(account.balance) + amount;

                    await manager.save(account);

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
                    if (error instanceof HttpException) throw error;
                    this.logger.error('Unexpected error during transaction', error);
                    throw new InternalServerErrorException(
                        'Transaction processing failed',
                    );
                }
            },
        );
    }

    public async getTransactions(accountId: string): Promise<Transaction[]> {
        try {
            const transaction = await this.transactionsRepository.find({
                where: { accountId },
                order: { createdAt: 'DESC' },
            });
            if (!transaction || transaction.length === 0) {
                this.logger.error(`Transaction not found for account: ${accountId}`);
                throw new NotFoundException('Transaction not found');
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
