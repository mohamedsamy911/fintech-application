import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Account } from './entities/accounts.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AccountsService {
    private readonly logger = new Logger(AccountsService.name);
    constructor(
        @InjectRepository(Account)
        private readonly accountsRepository: Repository<Account>,
    ) {
    }

    public async createAccount(): Promise<Account> {
        try {
            this.logger.log('Creating a new account');
            const account = this.accountsRepository.create();
            return await this.accountsRepository.save(account);
        } catch (error) {
            this.logger.error('Failed to create account', error);
            throw new InternalServerErrorException('Failed to create account');
        }
    }

    public async checkBalance(accountId: string): Promise<number> {
        try {
            const account = await this.accountsRepository.findOneBy({ id: accountId });
            if (!account) {
                this.logger.error(`Account not found: ${accountId}`);
                throw new NotFoundException('Account not found');
            }
            return account.balance;
        } catch (error) {
            this.logger.error('Failed to check account balance', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to check account balance');
        }
    }
}
