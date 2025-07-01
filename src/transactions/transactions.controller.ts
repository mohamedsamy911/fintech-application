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

    /**
     * POST /transactions
     *
     * Handles creation of a new transaction (DEPOSIT or WITHDRAWAL).
     * Delegates actual processing to the service layer which:
     * - Validates amount
     * - Locks and updates account balance
     * - Creates a transaction record
     *
     * Swagger decorators define API contract and response structure for documentation.
     *
     * @param createTransactionDto DTO with accountId, amount, type
     * @returns The newly created Transaction
     * @throws BadRequestException if input is invalid or logic fails (e.g. insufficient funds)
     * @throws InternalServerErrorException for unexpected server errors
     */
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
            // Forward any known HttpExceptions thrown by the service
            if (error instanceof HttpException) {
                throw error;
            }

            // Wrap any unexpected error
            throw new InternalServerErrorException('Transaction processing failed');
        }
    }

    /**
     * GET /transactions/:accountId
     *
     * Returns all transactions associated with the given account UUID.
     * Validates UUID before calling the service method to retrieve transactions.
     *
     *  Swagger decorators define API contract and response structure for documentation.
     *
     * @param accountId UUID string of the account
     * @returns An array of transactions, ordered from newest to oldest
     * @throws NotFoundException if account has no transactions.
     * @throws BadRequestException if the provided accountId is not a valid UUID v4.
     * @throws InternalServerErrorException for unexpected server errors
     */
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
        // Validate UUID format before passing it to the service
        if (!validate(accountId)) {
            throw new BadRequestException('Invalid transaction ID format');
        }
        try {
            return await this.transactionsService.getTransactions(accountId);
        } catch (error) {
            // Re-throw known HttpExceptions
            if (error instanceof HttpException) {
                throw error;
            }

            // Wrap any unexpected error
            throw new InternalServerErrorException('Transaction retrieval failed');
        }
    }
}
