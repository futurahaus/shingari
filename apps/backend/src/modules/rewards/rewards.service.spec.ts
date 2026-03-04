import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { PrismaService } from '../prisma/prisma.service';
import { DatabaseService } from '../database/database.service';

const mockReward = {
  id: 1,
  name: 'Test Reward',
  description: 'Description',
  image_url: null,
  points_cost: 100,
  stock: 50,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockPrisma = {
  rewards: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

const mockDatabaseService = {};

describe('RewardsService', () => {
  let service: RewardsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    service = module.get<RewardsService>(RewardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create reward with valid dto', async () => {
      mockPrisma.rewards.create.mockResolvedValueOnce(mockReward);

      const result = await service.create({
        name: 'Test Reward',
        description: 'Description',
        points_cost: 100,
        stock: 50,
      });

      expect(mockPrisma.rewards.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Test Reward',
            points_cost: 100,
            stock: 50,
          }),
        })
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe('Test Reward');
    });
  });

  describe('findAll', () => {
    it('should return paginated rewards', async () => {
      mockPrisma.rewards.count.mockResolvedValueOnce(1);
      mockPrisma.rewards.findMany.mockResolvedValueOnce([mockReward]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(mockPrisma.rewards.count).toHaveBeenCalled();
      expect(mockPrisma.rewards.findMany).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.rewards).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return reward when found', async () => {
      mockPrisma.rewards.findUnique.mockResolvedValueOnce(mockReward);

      const result = await service.findOne(1);

      expect(mockPrisma.rewards.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.rewards.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Recompensa con ID 999 no encontrada'
      );
    });
  });
});
