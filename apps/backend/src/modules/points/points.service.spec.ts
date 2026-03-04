import { Test, TestingModule } from '@nestjs/testing';
import { PointsService } from './points.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  $queryRaw: jest.fn(),
  points_ledger: {
    aggregate: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('PointsService', () => {
  let service: PointsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PointsService>(PointsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserPointsBalance', () => {
    it('should return balance when view exists', async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce([
        { user_id: 'user-1', total_points: 150 },
      ]);

      const result = await service.getUserPointsBalance('user-1');

      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result?.user_id).toBe('user-1');
      expect(result?.total_points).toBe(150);
    });

    it('should return null on error', async () => {
      mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('DB error'));
      mockPrisma.points_ledger.aggregate.mockRejectedValueOnce(new Error('DB error'));

      const result = await service.getUserPointsBalance('user-1');

      expect(result).toBeNull();
    });

    it('should use fallback when view returns empty', async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce([]);
      mockPrisma.points_ledger.aggregate.mockResolvedValueOnce({
        _sum: { points: 50 },
      });

      const result = await service.getUserPointsBalance('user-1');

      expect(result).toBeDefined();
      expect(result?.total_points).toBe(50);
    });
  });

  describe('getUserPointsLedger', () => {
    it('should return entries', async () => {
      const entries = [
        {
          id: 1,
          user_id: 'user-1',
          order_id: 'order-1',
          reward_id: null,
          points: 10,
          type: 'order',
          created_at: new Date(),
          orders: { id: 'order-1' },
        },
      ];
      mockPrisma.points_ledger.findMany.mockResolvedValueOnce(entries);

      const result = await service.getUserPointsLedger('user-1');

      expect(mockPrisma.points_ledger.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 'user-1' },
        })
      );
      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });
  });
});
