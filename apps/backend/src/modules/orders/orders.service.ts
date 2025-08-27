import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    this.logger.log(
      'Creating order with data:',
      JSON.stringify(createOrderDto, null, 2),
    );

    const { order_lines, order_addresses, order_payments, ...orderData } = createOrderDto;

    try {
      const { user_id, ...orderDataWithoutUserId } = orderData;
      if (!user_id) {
        throw new Error('user_id is required to create an order');
      }
      const order = await this.prisma.orders.create({
        data: {
          user_id,
          ...orderDataWithoutUserId,
          order_lines: {
            create: order_lines.map((line) => ({
              product_id: line.product_id,
              product_name: line.product_name,
              quantity: line.quantity,
              unit_price: line.unit_price,
            })),
          },
          order_addresses: {
            create: order_addresses.map((address) => ({
              type: address.type,
              full_name: address.full_name,
              address_line1: address.address_line1,
              address_line2: address.address_line2,
              city: address.city,
              state: address.state,
              postal_code: address.postal_code,
              country: address.country,
              phone: address.phone,
            })),
          },
          order_payments: {
            create: order_payments.map((payment) => ({
              payment_method: payment.payment_method,
              amount: payment.amount,
              transaction_id: payment.transaction_id,
              metadata: payment.metadata,
            })),
          },
        },
        include: {
          order_lines: true,
          order_addresses: true,
          order_payments: true,
        },
      });

      this.logger.log('Order created successfully:', (order as { id: string }).id);
      return this.mapToOrderResponse(order);
    } catch (error) {
      this.logger.error('Error creating order:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    const order = await this.prisma.orders.findUnique({
      where: { id },
      include: {
        order_lines: {
          include: {
            products: {
              select: {
                image_url: true,
              },
            },
          },
        },
        order_addresses: true,
        order_payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.mapToOrderResponse(order);
  }

  async findByUserId(userId: string): Promise<OrderResponseDto[]> {
    const orders = await this.prisma.orders.findMany({
      where: { user_id: userId },
      include: {
        order_lines: {
          include: {
            products: {
              select: {
                image_url: true,
              },
            },
          },
        },
        order_addresses: true,
        order_payments: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return orders.map(order => this.mapToOrderResponse(order));
  }

  async findAll(): Promise<OrderResponseDto[]> {
    const orders = await this.prisma.orders.findMany({
      include: {
        order_lines: {
          include: {
            products: {
              select: {
                image_url: true,
              },
            },
          },
        },
        order_addresses: true,
        order_payments: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    return orders.map((order) => this.mapToOrderResponse(order));
  }

  async findAllPaginated(
    page = 1,
    limit = 20,
    sortField = 'created_at',
    sortDirection = 'desc'
  ): Promise<[OrderResponseDto[], number]> {
    // Define valid sort fields and their mappings
    const sortFieldMap: Record<string, any> = {
      'created_at': { created_at: sortDirection },
      'updated_at': { updated_at: sortDirection },
      'total_amount': { total_amount: sortDirection },
      'status': { status: sortDirection },
      'user_name': { users: { users: { first_name: sortDirection } } },
    };

    const orderBy = sortFieldMap[sortField] || { created_at: 'desc' };

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.orders.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          order_lines: {
            include: {
              products: {
                select: {
                  image_url: true,
                },
              },
            },
          },
          order_addresses: true,
          order_payments: true,
          users: {
            include: {
              users: true, // This includes public_users data
            },
          },
        },
        orderBy,
      }),
      this.prisma.orders.count(),
    ]);
    return [orders.map((order) => this.mapToOrderResponse(order)), total];
  }

  private mapToOrderResponse(order: any): OrderResponseDto {
    return {
      id: order.id,
      user_id: order.user_id,
      user_email: order.users?.email || null,
      user_name: order.users?.users?.first_name && order.users?.users?.last_name
        ? `${order.users.users.first_name} ${order.users.users.last_name}`.trim()
        : order.users?.users?.trade_name || null,
      user_trade_name: order.users?.users?.trade_name || null,
      status: order.status,
      total_amount: order.total_amount,
      currency: order.currency,
      created_at: order.created_at,
      updated_at: order.updated_at,
      used_points: order.used_points || 0,
      order_lines: order.order_lines.map((line: any) => ({
        id: line.id,
        product_id: line.product_id,
        product_name: line.product_name,
        quantity: line.quantity,
        unit_price: line.unit_price,
        total_price: line.total_price,
        product_image: line.products?.image_url || null,
      })),
      order_addresses: order.order_addresses.map((address: any) => ({
        id: address.id,
        type: address.type,
        full_name: address.full_name,
        address_line1: address.address_line1,
        address_line2: address.address_line2,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
        phone: address.phone,
      })),
      order_payments: order.order_payments.map((payment: any) => ({
        id: payment.id,
        payment_method: payment.payment_method,
        status: payment.status,
        paid_at: payment.paid_at,
        amount: payment.amount,
        transaction_id: payment.transaction_id,
        metadata: payment.metadata,
      })),
    };
  }
}