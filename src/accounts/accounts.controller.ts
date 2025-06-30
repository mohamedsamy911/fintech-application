import {
    BadRequestException,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    InternalServerErrorException,
    Param,
    Post,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { Account } from './entities/accounts.entity';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { validate } from 'uuid';

@Controller('accounts')
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) { }

    @ApiOperation({ summary: 'Create a new account' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        example: {
            id: 'af7e6925-4f35-4795-943b-7d771b60f787',
            balance: '0',
            createdAt: '2025-06-30T18:56:08.565Z',
        },
        description: 'Account created successfully',
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        example: {
            statusCode: 500,
            timestamp: '2025-06-30T19:04:05.003Z',
            path: '/accounts',
            message: 'Account creation failed',
        },
        description: 'Account creation failed',
    })
    @Post()
    async createAccount(): Promise<Account> {
        try {
            return await this.accountsService.createAccount();
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException('Account creation failed');
        }
    }

    @ApiOperation({ summary: 'Get account balance' })
    @ApiResponse({
        status: HttpStatus.OK,
        example: 2000,
        description: 'Account balance',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        example: {
            statusCode: 404,
            timestamp: '2025-06-30T19:04:05.003Z',
            path: '/accounts/af7e6925-4f35-4795-943b-7d771b60f787',
            message: 'Account not found',
        },
        description: 'Account not found',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        example: {
            statusCode: 400,
            timestamp: '2025-06-30T19:04:05.003Z',
            path: '/accounts/af7e6925-4f35-4795-943b-7d771b60f787',
            message: 'Invalid account ID format',
        },
        description: 'Invalid account ID format'
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        example: {
            statusCode: 500,
            timestamp: '2025-06-30T19:04:05.003Z',
            path: '/accounts/af7e6925-4f35-4795-943b-7d771b60f787',
            message: 'Account balance check failed',
        },
        description: 'Account balance check failed',
    })
    @Get(':id')
    async getBalance(@Param('id') id: string): Promise<number> {
        if (!validate(id)) {
            throw new BadRequestException('Invalid account ID format');
        }
        try {
            return await this.accountsService.checkBalance(id);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException('Account balance check failed');
        }
    }
}
