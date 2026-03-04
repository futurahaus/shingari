import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { PrismaService } from '../prisma/prisma.service';
import { product_states } from '../../../generated/prisma';

const mockProduct = {
  id: 1,
  name: 'Product',
  list_price: { toNumber: () => 100 },
  wholesale_price: { toNumber: () => 80 },
  iva: { toNumber: () => 21 },
  sku: 'SKU1',
  status: product_states.active,
  product_images: [{ image_url: 'http://img.url' }],
};

const mockPrisma = {
  favorites: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  products: {
    findUnique: jest.fn(),
  },
  user_roles: {
    findFirst: jest.fn(),
  },
  products_discounts: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('FavoritesService', () => {
  let service: FavoritesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFavorites', () => {
    it('should return empty array when no favorites', async () => {
      mockPrisma.user_roles.findFirst.mockResolvedValue(null);
      mockPrisma.favorites.findMany.mockResolvedValueOnce([]);
      mockPrisma.products_discounts.findMany.mockResolvedValueOnce([]);

      const result = await service.getFavorites('user-1');

      expect(result).toBeDefined();
      expect(result.favorites).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('addFavorite', () => {
    it('should add favorite when product exists and not already favorited', async () => {
      const favorite = { user_id: 'user-1', product_id: 1, created_at: new Date() };
      mockPrisma.products.findUnique.mockResolvedValueOnce(mockProduct);
      mockPrisma.favorites.findUnique.mockResolvedValueOnce(null);
      mockPrisma.favorites.create.mockResolvedValueOnce(favorite);
      mockPrisma.user_roles.findFirst.mockResolvedValue(null);
      mockPrisma.products_discounts.findFirst.mockResolvedValue(null);

      const result = await service.addFavorite('user-1', 1);

      expect(mockPrisma.favorites.create).toHaveBeenCalledWith({
        data: { user_id: 'user-1', product_id: 1 },
      });
      expect(result).toBeDefined();
      expect(result.product_id).toBe(1);
    });

    it('should throw ConflictException when already in favorites', async () => {
      mockPrisma.products.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.favorites.findUnique.mockResolvedValue({ user_id: 'user-1', product_id: 1 });

      await expect(service.addFavorite('user-1', 1)).rejects.toThrow(ConflictException);
      await expect(service.addFavorite('user-1', 1)).rejects.toThrow(
        'Product is already in favorites'
      );
    });
  });

  describe('removeFavorite', () => {
    it('should remove favorite when exists', async () => {
      mockPrisma.favorites.findUnique.mockResolvedValueOnce({
        user_id: 'user-1',
        product_id: 1,
      });
      mockPrisma.favorites.delete.mockResolvedValueOnce({});

      await service.removeFavorite('user-1', 1);

      expect(mockPrisma.favorites.delete).toHaveBeenCalledWith({
        where: { user_id_product_id: { user_id: 'user-1', product_id: 1 } },
      });
    });

    it('should throw NotFoundException when favorite not found', async () => {
      mockPrisma.favorites.findUnique.mockResolvedValue(null);

      await expect(service.removeFavorite('user-1', 999)).rejects.toThrow(NotFoundException);
      await expect(service.removeFavorite('user-1', 999)).rejects.toThrow('Favorite not found');
    });
  });
});
