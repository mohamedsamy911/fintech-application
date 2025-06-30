import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from './accounts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Account } from './entities/accounts.entity';
import { Repository } from 'typeorm';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('AccountsService', () => {
  let service: AccountsService;
  let repo: Repository<Account>;

  const mockAccount: Account = {
    id: 'af7e6925-4f35-4795-943b-7d771b60f787',
    balance: 1000,
    createdAt: new Date(),
  };

  const mockRepo = {
    create: jest.fn().mockReturnValue(mockAccount),
    save: jest.fn().mockResolvedValue(mockAccount),
    findOneBy: jest.fn().mockResolvedValue(mockAccount),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    repo = module.get(getRepositoryToken(Account));
  });

  it('should create account successfully', async () => {
    await expect(service.createAccount()).resolves.toEqual(mockAccount);
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
  });

  it('should throw if createAccount fails', async () => {
    jest.spyOn(repo, 'save').mockRejectedValueOnce(new Error());
    await expect(service.createAccount()).rejects.toThrow(InternalServerErrorException);
  });

  it('should return balance for valid account', async () => {
    await expect(service.checkBalance('af7e6925-4f35-4795-943b-7d771b60f787')).resolves.toBe(1000);
  });

  it('should throw NotFound if account does not exist', async () => {
    jest.spyOn(repo, 'findOneBy').mockResolvedValueOnce(null);
    await expect(service.checkBalance('af7e6925-4f35-4795-943b-7d771b60f786')).rejects.toThrow(NotFoundException);
  });

  it('should throw InternalServerError if something else fails', async () => {
    jest.spyOn(repo, 'findOneBy').mockRejectedValueOnce(new Error());
    await expect(service.checkBalance('any')).rejects.toThrow(InternalServerErrorException);
  });
});
