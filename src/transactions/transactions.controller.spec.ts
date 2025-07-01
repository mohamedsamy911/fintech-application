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
    getTransactions: jest.fn().mockResolvedValue([mockTransaction]),
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

  it('should create a successful withdrawal transaction', async () => {
    const dto = {
      accountId: 'acc-id',
      amount: 50,
      type: TransactionType.WITHDRAWAL,
    };

    mockService.createTransaction.mockResolvedValueOnce(mockTransaction);
    const result = await controller.createTransaction(dto);
    expect(result).toEqual(mockTransaction);
    expect(service.createTransaction).toHaveBeenCalledWith(dto);
  });

  it('should throw BadRequestException if funds are insufficient', async () => {
    const dto = {
      accountId: 'acc-id',
      amount: 1000,
      type: TransactionType.WITHDRAWAL,
    };

    mockService.createTransaction.mockRejectedValueOnce(
      new BadRequestException('Insufficient funds'),
    );

    await expect(controller.createTransaction(dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw bad request error on invalid transaction amount', async () => {
    const dto: CreateTransactionDto = {
      accountId: 'acc-id',
      amount: -200,
      type: TransactionType.DEPOSIT,
    };
    jest
      .spyOn(service, 'createTransaction')
      .mockRejectedValueOnce(new BadRequestException());
    await expect(controller.createTransaction(dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw not found error on account not found', async () => {
    const dto: CreateTransactionDto = {
      accountId: 'acc-id-2',
      amount: 200,
      type: TransactionType.DEPOSIT,
    };
    jest
      .spyOn(service, 'createTransaction')
      .mockRejectedValueOnce(new NotFoundException());
    await expect(controller.createTransaction(dto)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw bad request error on insufficient funds', async () => {
    const dto: CreateTransactionDto = {
      accountId: 'acc-id',
      amount: 1000,
      type: TransactionType.WITHDRAWAL,
    };
    jest
      .spyOn(service, 'createTransaction')
      .mockRejectedValueOnce(new BadRequestException());
    await expect(controller.createTransaction(dto)).rejects.toThrow(
      BadRequestException,
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

  it('should return account transactions', async () => {
    const accountId = 'af7e6925-4f35-4795-943b-7d771b60f775';
    const transactions = [
      {
        id: 'af7e6925-4f35-4795-943b-7d771b60f787',
        accountId,
        amount: 100,
        type: TransactionType.DEPOSIT,
        createdAt: new Date(),
        account: {
          id: accountId,
          balance: 100,
          createdAt: new Date(),
        },
      },
      {
        id: 'af7e6925-4f35-4795-943b-7d771b60f786',
        accountId,
        amount: 200,
        type: TransactionType.WITHDRAWAL,
        createdAt: new Date(),
        account: {
          id: accountId,
          balance: 200,
          createdAt: new Date(),
        },
      },
    ];
    jest.spyOn(service, 'getTransactions').mockResolvedValue(transactions);
    const result = await controller.getTransactions(accountId);
    expect(result).toEqual(transactions);
  });

  it('should return 404 when account transactions not found', async () => {
    const accountId = 'af7e6925-4f35-4795-943b-7d771b60f781';
    jest.spyOn(service, 'getTransactions').mockRejectedValueOnce(new NotFoundException());
    await expect(controller.getTransactions(accountId)).rejects.toThrow(NotFoundException);
  });

  it('should return 500 when transaction retrieval fails', async () => {
    const accountId = 'af7e6925-4f35-4795-943b-7d771b60f782';
    jest.spyOn(service, 'getTransactions').mockRejectedValueOnce(new Error());
    await expect(controller.getTransactions(accountId)).rejects.toThrow(
      'Transaction retrieval failed',
    );
  });
});
