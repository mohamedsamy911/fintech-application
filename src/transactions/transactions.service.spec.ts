import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService, TransactionType } from './transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from './entities/transactions.entity';
import { Account } from '../accounts/entities/accounts.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

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
});
