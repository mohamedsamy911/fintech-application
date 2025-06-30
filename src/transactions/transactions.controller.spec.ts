import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService, TransactionType } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './entities/transactions.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: TransactionsService;

  const mockTransaction: Transaction = {
    id: 'txn-id',
    accountId: 'acc-id',
    amount: 200,
    type: 'DEPOSIT',
    createdAt: new Date(),
    account: {
      id: 'acc-id',
      balance: 200,
      createdAt: new Date(),
    },
  };

  const mockService = {
    createTransaction: jest.fn().mockResolvedValue(mockTransaction),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [{ provide: TransactionsService, useValue: mockService }],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should create a transaction successfully', async () => {
    const dto: CreateTransactionDto = {
      accountId: 'acc-id',
      amount: 200,
      type: TransactionType.DEPOSIT,
    };
    await expect(controller.createTransaction(dto)).resolves.toEqual(
      mockTransaction,
    );
    expect(service.createTransaction).toHaveBeenCalledWith(dto);
  });

  it('should throw bad request error on invalid transaction amount', async () => {
    const dto: CreateTransactionDto = {
      accountId: 'acc-id',
      amount: -200,
      type: TransactionType.DEPOSIT,
    };
    jest.spyOn(service, 'createTransaction').mockRejectedValueOnce(new BadRequestException());
    await expect(controller.createTransaction(dto)).rejects.toThrow(
      BadRequestException
    );
  });

  it('should throw not found error on account not found', async () => {
    const dto: CreateTransactionDto = {
      accountId: 'acc-id-2',
      amount: 200,
      type: TransactionType.DEPOSIT,
    };
    jest.spyOn(service, 'createTransaction').mockRejectedValueOnce(new NotFoundException());
    await expect(controller.createTransaction(dto)).rejects.toThrow(
      NotFoundException
    );
  });

  it('should throw bad request error on insufficient funds', async () => {
    const dto: CreateTransactionDto = {
      accountId: 'acc-id',
      amount: 1000,
      type: TransactionType.WITHDRAWAL,
    };
    jest.spyOn(service, 'createTransaction').mockRejectedValueOnce(new BadRequestException());
    await expect(controller.createTransaction(dto)).rejects.toThrow(
      BadRequestException
    );
  });
  
  it('should throw internal error on transaction creation failure', async () => {
    jest.spyOn(service, 'createTransaction').mockRejectedValueOnce(new Error());
    const dto: CreateTransactionDto = {
      accountId: 'acc-id',
      amount: 200,
      type: TransactionType.DEPOSIT,
    };
    await expect(controller.createTransaction(dto)).rejects.toThrow(
      'Transaction processing failed',
    );
  });
});
