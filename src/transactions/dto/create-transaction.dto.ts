import { IsIn, IsNumber, IsString, IsUUID } from 'class-validator';
import { TransactionType } from '../transactions.service';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
    @ApiProperty({
        description: 'Account ID',
        type: 'string',
        example: '123e4567-e89b-12d3-a456-426655440000',
    })
    @IsString()
    @IsUUID('4')
    accountId: string;

    @ApiProperty({
        description: 'Transaction amount',
        type: 'number',
        example: 100,
    })
    @IsNumber()
    amount: number;

    @ApiProperty({
        description: 'Transaction type',
        type: 'string',
        example: 'DEPOSIT',
    })
    @IsString()
    @IsIn(['DEPOSIT', 'WITHDRAWAL'])
    type: TransactionType;
}
