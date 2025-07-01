import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService, TransactionType } from './transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from './entities/transactions.entity';
import { Account } from '../accounts/entities/accounts.entity';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('TransactionsService', () => {
  let service: TransactionsService;

  const mockAccount: Account = {
    id: 'acc-1',
    balance: 1000,
    createdAt: new Date(),
  };

  const mockTransaction: Transaction = {
    id: 'txn-1',
    accountId: 'acc-1',
    amount: 100,
    type: TransactionType.DEPOSIT,
    createdAt: new Date(),
    account: mockAccount,
  };

  const mockEntityManager = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockRepo = {
    manager: {
      transaction: jest.fn(),
    },
    findBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should throw if amount is negative', async () => {
    await expect(
      service.createTransaction({
        accountId: 'acc-1',
        amount: -100,
        type: TransactionType.DEPOSIT,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw if account not found', async () => {
    mockRepo.manager.transaction.mockImplementationOnce(async (cb) => {
      mockEntityManager.findOne.mockResolvedValue(null);
      return cb(mockEntityManager);
    });

    await expect(
      service.createTransaction({
        accountId: 'acc-1',
        amount: 100,
        type: TransactionType.DEPOSIT,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw if withdrawal exceeds balance', async () => {
    mockRepo.manager.transaction.mockImplementationOnce(async (cb) => {
      mockEntityManager.findOne.mockResolvedValue({
        ...mockAccount,
        balance: 50,
      });
      return cb(mockEntityManager);
    });

    await expect(
      service.createTransaction({
        accountId: 'acc-1',
        amount: 100,
        type: TransactionType.WITHDRAWAL,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should succeed with valid deposit', async () => {
    mockRepo.manager.transaction.mockImplementationOnce(async (cb) => {
      mockEntityManager.findOne.mockResolvedValue({ ...mockAccount });
      mockEntityManager.save.mockResolvedValueOnce({
        ...mockAccount,
        balance: 1100,
      });
      mockEntityManager.create.mockReturnValue(mockTransaction); // create transaction
      mockEntityManager.save.mockResolvedValueOnce(mockTransaction); // save transaction
      return cb(mockEntityManager);
    });

    const result = await service.createTransaction({
      accountId: 'acc-1',
      amount: 100,
      type: TransactionType.DEPOSIT,
    });

    expect(result).toEqual(mockTransaction);
    expect(mockEntityManager.save).toHaveBeenCalledTimes(2);
  });

  it('should successfully withdraw funds from an account', async () => {
    const dto = {
      accountId: 'acc-id',
      amount: 100,
      type: TransactionType.WITHDRAWAL,
    };

    const mockAccount = { id: 'acc-id', balance: 200, createdAt: new Date() };
    const savedAccount = { ...mockAccount, balance: 100 };
    const savedTransaction = {
      id: 'txn-id',
      accountId: 'acc-id',
      amount: 100,
      type: TransactionType.WITHDRAWAL,
      createdAt: new Date(),
      balanceAfter: 100,
      account: mockAccount,
    };

    mockRepo.manager.transaction.mockImplementationOnce(async (cb) => {
      mockEntityManager.findOne.mockResolvedValueOnce(mockAccount);
      mockEntityManager.save
        .mockResolvedValueOnce(savedAccount)
        .mockResolvedValueOnce(savedTransaction);
      mockEntityManager.create.mockReturnValueOnce(savedTransaction);

      return cb(mockEntityManager);
    });

    const result = await service.createTransaction(dto);
    expect(result).toEqual(savedTransaction);
  });

  it('should throw BadRequestException if balance is insufficient for withdrawal', async () => {
    const dto = {
      accountId: 'acc-id',
      amount: 1000,
      type: TransactionType.WITHDRAWAL,
    };

    const mockAccount = { id: 'acc-id', balance: 500, createdAt: new Date() };

    mockRepo.manager.transaction.mockImplementationOnce(async (cb) => {
      mockEntityManager.findOne.mockResolvedValueOnce(mockAccount);
      return cb(mockEntityManager);
    });

    await expect(service.createTransaction(dto)).rejects.toThrow('Insufficient funds');
  });

  it('should throw InternalServerErrorException if an unknown error occurs inside transaction', async () => {
    const dto = {
      accountId: 'acc-id',
      amount: 100,
      type: TransactionType.DEPOSIT,
    };

    mockRepo.manager.transaction.mockImplementationOnce(async (cb) => {
      return cb({
        findOne: () => {
          throw new Error('Some unexpected error');
        },
        save: jest.fn(),
        create: jest.fn(),
      });
    });

    await expect(service.createTransaction(dto)).rejects.toThrow(InternalServerErrorException);
  });

  it('should return transactions for account', async () => {
    mockRepo.findBy.mockResolvedValueOnce([mockTransaction]);
    const result = await mockRepo.findBy('acc-1');
    expect(result).toEqual([mockTransaction]);
  });

  it('should throw if transaction not found', async () => {
    mockRepo.findBy.mockRejectedValueOnce(new NotFoundException());
    await expect(mockRepo.findBy('acc-1')).rejects.toThrow(NotFoundException);
  });

  it('should throw if retrieval fails', async () => {
    mockRepo.findBy.mockRejectedValueOnce(new InternalServerErrorException());
    await expect(mockRepo.findBy('acc-1')).rejects.toThrow(InternalServerErrorException);
  });
});
