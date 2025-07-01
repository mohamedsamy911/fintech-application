import {
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Account } from './entities/accounts.entity';
import { InjectRepository } from '@nestjs/typeorm';

/**
 * Service responsible for handling business logic related to user accounts.
 * Includes creation of new accounts and balance inquiry.
 */
@Injectable()
export class AccountsService {
    private readonly logger = new Logger(AccountsService.name);
    constructor(
        @InjectRepository(Account)
        private readonly accountsRepository: Repository<Account>,
    ) { }

    /**
     * Creates a new bank account with a default balance (typically 0).
     *
     * @returns The newly created Account entity.
     * @throws InternalServerErrorException if saving fails.
     *
     * @note The account entity uses database defaults to populate initial values.
     * @credit Based on standard RESTful account initialization patterns.
     */
    public async createAccount(): Promise<Account> {
        try {
            this.logger.log('Creating a new account');
            const account = this.accountsRepository.create(); // Initializes an account with default field
            return await this.accountsRepository.save(account); // Persists it in the DB
        } catch (error) {
            this.logger.error('Failed to create account', error);
            throw new InternalServerErrorException('Failed to create account');
        }
    }

    /**
     * Checks and returns the current balance of a specific account.
     *
     * @param accountId UUID of the account to check.
     * @returns The numeric balance of the account.
     * @throws NotFoundException if account does not exist.
     * @throws InternalServerErrorException for unexpected errors.
     *
     * @credit Inspired by basic banking operations: ID-based lookup + exception-safe reporting.
     */
    public async checkBalance(accountId: string): Promise<number> {
        try {
            const account = await this.accountsRepository.findOneBy({
                id: accountId,
            });
            if (!account) {
                this.logger.error(`Account not found: ${accountId}`);
                throw new NotFoundException('Account not found');
            }
            return account.balance;
        } catch (error) {
            this.logger.error('Failed to check account balance', error);

            // Preserve specific NotFoundException
            if (error instanceof NotFoundException) {
                throw error;
            }

            // Wrap unknown errors for safety
            throw new InternalServerErrorException('Failed to check account balance');
        }
    }
}
