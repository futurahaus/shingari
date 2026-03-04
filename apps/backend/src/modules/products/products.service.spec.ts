import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { DatabaseService } from '../database/database.service';
import { product_states } from '../../../generated/prisma';

const mockProduct = {
  id: 1,
  name: 'Test Product',
  description: 'Description',
  status: product_states.active,
  sku: 'SKU1',
  list_price: { toNumber: () => 100 },
  wholesale_price: { toNumber: () => 80 },
  iva: { toNumber: () => 21 },
  created_at: new Date(),
  units_per_box: 10,
  products_categories: [{ categories: { category_translations: [], name: 'Cat1' } }],
  product_images: [{ image_url: 'http://img.url' }],
  product_translations: [],
  products_stock: [{ quantity: { toNumber: () => 50 }, units: { name: 'unit' } }],
};

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const mockPrisma = {
  products: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  user_roles: {
    findFirst: jest.fn(),
  },
  products_discounts: {
    findFirst: jest.fn(),
  },
  $transaction: jest.fn((fn) => (typeof fn === 'function' ? fn(mockPrisma) : Promise.all(fn))),
};

const mockDatabaseService = {};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockCacheManager.get.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserRole', () => {
    it('should return role when found', async () => {
      mockPrisma.user_roles.findFirst.mockResolvedValueOnce({
        roles: { name: 'admin' },
      });

      const result = await service.getUserRole('user-1');

      expect(mockPrisma.user_roles.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { user_id: 'user-1' } })
      );
      expect(result).toBe('admin');
    });

    it('should return null when no role', async () => {
      mockPrisma.user_roles.findFirst.mockResolvedValueOnce(null);

      const result = await service.getUserRole('user-1');

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return product when found', async () => {
      mockCacheManager.get.mockResolvedValueOnce(undefined);
      mockPrisma.products.findUnique.mockResolvedValueOnce(mockProduct);
      mockPrisma.user_roles.findFirst.mockResolvedValue(null);
      mockPrisma.products_discounts.findFirst.mockResolvedValue(null);

      const result = await service.findOne(1);

      expect(mockPrisma.products.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1, status: product_states.active },
        })
      );
      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(result.name).toBe('Test Product');
    });

    it('should throw NotFoundException when not found', async () => {
      mockCacheManager.get.mockResolvedValueOnce(undefined);
      mockPrisma.products.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Producto con ID "999" no encontrado o no está activo'
      );
    });
  });

  describe('toggleStatus', () => {
    it('should toggle from active to paused', async () => {
      const activeProduct = { id: 1, status: product_states.active };
      const pausedProduct = { id: 1, status: product_states.paused };
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        const tx = {
          products: {
            findUnique: jest.fn().mockResolvedValue(activeProduct),
            update: jest.fn().mockResolvedValue(pausedProduct),
          },
        };
        return fn(tx);
      });

      const result = await service.toggleStatus('1');

      expect(result).toBeDefined();
      expect(result.status).toBe('paused');
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        const tx = {
          products: {
            findUnique: jest.fn().mockResolvedValue(null),
            update: jest.fn(),
          },
        };
        return fn(tx);
      });

      await expect(service.toggleStatus('999')).rejects.toThrow(NotFoundException);
      await expect(service.toggleStatus('999')).rejects.toThrow(
        'Producto con ID "999" no encontrado'
      );
    });
  });

  describe('findAllPublic', () => {
    it('should return paginated products', async () => {
      mockCacheManager.get.mockResolvedValueOnce(undefined);
      mockPrisma.products.findMany.mockResolvedValueOnce([mockProduct]);
      mockPrisma.products.count.mockResolvedValueOnce(1);
      mockPrisma.user_roles.findFirst.mockResolvedValue(null);
      mockPrisma.products_discounts.findFirst.mockResolvedValue(null);

      const result = await service.findAllPublic({ page: 1, limit: 10 });

      expect(mockPrisma.products.findMany).toHaveBeenCalled();
      expect(mockPrisma.products.count).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });
});
