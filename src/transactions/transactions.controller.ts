import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    InternalServerErrorException,
    Param,
    Post,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './entities/transactions.entity';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { validate } from 'uuid';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @ApiOperation({ summary: 'Create a new transaction' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        example: {
            id: '123e4567-e89b-12d3-a456-426655440000',
            accountId: '123e4567-e89b-12d3-a456-426655440000',
            amount: 100,
            type: 'DEPOSIT',
            createdAt: '2023-08-01T00:00:00.000Z',
        },
        description: 'Transaction created successfully',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        example: {
            statusCode: 400,
            timestamp: '2025-06-30T19:04:05.003Z',
            path: '/transactions',
            message: 'Amount must be positive',
        },
        description: 'Transaction creation failed',
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        example: {
            statusCode: 500,
            timestamp: '2025-06-30T19:04:05.003Z',
            path: '/transactions',
            message: 'Transaction processing failed',
        },
        description: 'Transaction processing failed',
    })
    @Post()
    async createTransaction(
        @Body() createTransactionDto: CreateTransactionDto,
    ): Promise<Transaction> {
        try {
            return await this.transactionsService.createTransaction(
                createTransactionDto,
            );
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException('Transaction processing failed');
        }
    }

    @ApiOperation({ summary: 'Get account transactions' })
    @ApiResponse({
        status: HttpStatus.OK,
        example: [
            {
                id: '123e4567-e89b-12d3-a456-426655440000',
                accountId: '123e4567-e89b-12d3-a456-426655440000',
                amount: 100,
                type: 'DEPOSIT',
                createdAt: '2023-08-01T00:00:00.000Z',
            },
        ],
        description: 'Account transactions',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        example: {
            statusCode: 404,
            timestamp: '2025-06-30T19:04:05.003Z',
            path: '/transactions/123e4567-e89b-12d3-a456-426655440000',
            message: 'Transaction not found',
        },
        description: 'Transaction not found',
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        example: {
            statusCode: 500,
            timestamp: '2025-06-30T19:04:05.003Z',
            path: '/transactions/123e4567-e89b-12d3-a456-426655440000',
            message: 'Transaction retrieval failed',
        },
        description: 'Transaction retrieval failed',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        example: {
            statusCode: 400,
            timestamp: '2025-06-30T19:04:05.003Z',
            path: '/transactions/123e4567-e89b-12d3-a456-42665544000',
            message: 'Invalid transaction ID format',
        },
        description: 'Invalid transaction ID format',
    })
    @Get(':accountId')
    async getTransactions(
        @Param('accountId') accountId: string,
    ): Promise<Transaction[]> {
        if (!validate(accountId)) {
            throw new BadRequestException('Invalid transaction ID format');
        }
        try {
            return await this.transactionsService.getTransactions(accountId);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException('Transaction retrieval failed');
        }
    }
}
