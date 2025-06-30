import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { Account } from './entities/accounts.entity';
import { NotFoundException } from '@nestjs/common';

describe('AccountsController', () => {
  let controller: AccountsController;
  let service: AccountsService;

  const mockAccount: Account = {
    id: 'af7e6925-4f35-4795-943b-7d771b60f787',
    balance: 0,
    createdAt: new Date(),
  };

  const mockService = {
    createAccount: jest.fn().mockResolvedValue(mockAccount),
    checkBalance: jest.fn().mockResolvedValue(1000),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [{ provide: AccountsService, useValue: mockService }],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
    service = module.get<AccountsService>(AccountsService);
  });

  it('should create an account successfully', async () => {
    await expect(controller.createAccount()).resolves.toEqual(mockAccount);
    expect(service.createAccount).toHaveBeenCalled();
  });

  it('should throw internal error on createAccount failure', async () => {
    jest.spyOn(service, 'createAccount').mockRejectedValueOnce(new Error());
    await expect(controller.createAccount()).rejects.toThrow(
      'Account creation failed',
    );
  });

  it('should return account balance', async () => {
    await expect(
      controller.getBalance('af7e6925-4f35-4795-943b-7d771b60f787'),
    ).resolves.toBe(1000);
    expect(service.checkBalance).toHaveBeenCalledWith(
      'af7e6925-4f35-4795-943b-7d771b60f787',
    );
  });

  it('should throw NotFound error if account does not exist', async () => {
    jest
      .spyOn(service, 'checkBalance')
      .mockRejectedValueOnce(new NotFoundException('Account not found'));

    await expect(
      controller.getBalance('af7e6925-4f35-4795-943b-7d771b60f786'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw internal error on checkBalance failure', async () => {
    jest.spyOn(service, 'checkBalance').mockRejectedValueOnce(new Error());
    await expect(
      controller.getBalance('af7e6925-4f35-4795-943b-7d771b60f787'),
    ).rejects.toThrow('Account balance check failed');
  });
});
