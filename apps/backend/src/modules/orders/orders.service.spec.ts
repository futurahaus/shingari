import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { DatabaseService } from '../database/database.service';
import { MailService } from '../mail/mail.service';

const mockOrder = {
  id: 'order-1',
  user_id: 'user-1',
  status: 'pending',
  total_amount: 100,
  currency: 'EUR',
  order_number: '20260101001',
  created_at: new Date(),
  updated_at: new Date(),
  delivery_date: null,
  cancellation_reason: null,
  cancellation_date: null,
  invoice_file_url: null,
  earned_points: 0,
  order_lines: [
    {
      id: 'line-1',
      product_id: 1,
      product_name: 'Product A',
      quantity: 2,
      unit_price: 50,
      total_price: 100,
      products: { image_url: null, sku: 'SKU1', iva: null, products_stock: [{ quantity: 10 }] },
    },
  ],
  order_addresses: [],
  order_payments: [],
  users: { email: 'test@test.com', user_roles: [{ roles: { name: 'client' } }], users: null },
};

const mockPrisma = {
  orders: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  order_lines: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  order_payments: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  products: {
    findUnique: jest.fn(),
  },
  user_roles: {
    findFirst: jest.fn(),
  },
  products_discounts: {
    findFirst: jest.fn(),
  },
  $transaction: jest.fn((fn) => (Array.isArray(fn) ? Promise.all(fn) : fn())),
};

const mockDatabaseService = {};
const mockMailService = { sendEmail: jest.fn() };

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return order when found', async () => {
      mockPrisma.orders.findUnique.mockResolvedValueOnce(mockOrder);

      const result = await service.findOne('order-1');

      expect(mockPrisma.orders.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'order-1' } })
      );
      expect(result).toBeDefined();
      expect(result.id).toBe('order-1');
      expect(result.status).toBe('pending');
    });

    it('should throw NotFoundException when order not found', async () => {
      mockPrisma.orders.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Order with ID non-existent not found'
      );
    });
  });

  describe('updateOrderLine', () => {
    it('should update quantity and recalculate totals', async () => {
      const editableOrder = { ...mockOrder, status: 'pending', user_id: 'user-1' };
      const line = { id: 'line-1', order_id: 'order-1', product_id: 1, quantity: 2 };
      mockPrisma.orders.findUnique.mockResolvedValue(editableOrder);
      mockPrisma.order_lines.findFirst.mockResolvedValue(line);
      mockPrisma.order_lines.update.mockResolvedValue({});
      mockPrisma.order_lines.findMany.mockResolvedValue([{ ...line, quantity: 3 }]);
      mockPrisma.order_payments.findFirst.mockResolvedValue(null);
      mockPrisma.$transaction.mockResolvedValue(undefined);

      const result = await service.updateOrderLine(
        'order-1',
        'line-1',
        { quantity: 3 },
        'user-1',
        true
      );

      expect(mockPrisma.order_lines.update).toHaveBeenCalledWith({
        where: { id: 'line-1' },
        data: { quantity: 3 },
      });
      expect(result).toBeDefined();
    });

    it('should throw when order is not editable (status not pending/accepted)', async () => {
      mockPrisma.orders.findUnique.mockResolvedValue({
        ...mockOrder,
        status: 'delivered',
      });

      await expect(
        service.updateOrderLine('order-1', 'line-1', { quantity: 3 }, 'user-1', true)
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateOrderLine('order-1', 'line-1', { quantity: 3 }, 'user-1', true)
      ).rejects.toThrow('Este pedido no se puede editar');
    });

    it('should throw NotFoundException when line not found', async () => {
      mockPrisma.orders.findUnique.mockResolvedValue({ ...mockOrder, status: 'pending' });
      mockPrisma.order_lines.findFirst.mockResolvedValue(null);

      await expect(
        service.updateOrderLine('order-1', 'line-99', { quantity: 3 }, 'user-1', true)
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateOrderLine('order-1', 'line-99', { quantity: 3 }, 'user-1', true)
      ).rejects.toThrow('Línea de orden no encontrada');
    });
  });

  describe('addOrderLine', () => {
    it('should add new line and recalculate totals', async () => {
      const product = { id: 1, name: 'Product B', status: 'active', list_price: 25, wholesale_price: 20 };
      mockPrisma.orders.findUnique.mockResolvedValue({ ...mockOrder, status: 'pending', user_id: 'user-1' });
      mockPrisma.products.findUnique.mockResolvedValue(product);
      mockPrisma.user_roles.findFirst.mockResolvedValue(null);
      mockPrisma.products_discounts.findFirst.mockResolvedValue(null);
      mockPrisma.order_lines.findFirst.mockResolvedValue(null);
      mockPrisma.order_lines.create.mockResolvedValue({});
      mockPrisma.order_lines.findMany.mockResolvedValue([{ quantity: 1 }]);
      mockPrisma.order_payments.findFirst.mockResolvedValue(null);
      mockPrisma.$transaction.mockResolvedValue(undefined);
      mockPrisma.orders.findUnique.mockResolvedValueOnce(mockOrder).mockResolvedValueOnce(mockOrder);

      const result = await service.addOrderLine(
        'order-1',
        { product_id: 1, quantity: 1 },
        'user-1',
        true
      );

      expect(mockPrisma.order_lines.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('removeOrderLine', () => {
    it('should remove line and recalculate when multiple lines exist', async () => {
      const lines = [
        { id: 'line-1', order_id: 'order-1' },
        { id: 'line-2', order_id: 'order-1' },
      ];
      mockPrisma.orders.findUnique.mockResolvedValue({ ...mockOrder, status: 'pending', user_id: 'user-1' });
      mockPrisma.order_lines.findMany.mockResolvedValue(lines);
      mockPrisma.order_lines.delete.mockResolvedValue({});
      mockPrisma.order_lines.findMany.mockResolvedValueOnce(lines).mockResolvedValueOnce([lines[1]]);
      mockPrisma.order_payments.findFirst.mockResolvedValue(null);
      mockPrisma.$transaction.mockResolvedValue(undefined);
      mockPrisma.orders.findUnique.mockResolvedValue(mockOrder);

      const result = await service.removeOrderLine('order-1', 'line-1', 'user-1', true);

      expect(mockPrisma.order_lines.delete).toHaveBeenCalledWith({ where: { id: 'line-1' } });
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when only one line remains', async () => {
      mockPrisma.orders.findUnique.mockResolvedValue({ ...mockOrder, status: 'pending' });
      mockPrisma.order_lines.findMany.mockResolvedValue([{ id: 'line-1', order_id: 'order-1' }]);

      await expect(
        service.removeOrderLine('order-1', 'line-1', 'user-1', true)
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.removeOrderLine('order-1', 'line-1', 'user-1', true)
      ).rejects.toThrow('El pedido debe tener al menos un producto');
    });
  });
});
