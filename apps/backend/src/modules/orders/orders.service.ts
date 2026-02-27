import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DatabaseService } from '../database/database.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AddOrderLineDto } from './dto/add-order-line.dto';
import { UpdateOrderLineDto } from './dto/update-order-line.dto';
import { OrderResponseDto } from './dto/order-response.dto';

const EDITABLE_STATUSES = ['pending', 'accepted'];

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly databaseService: DatabaseService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    this.logger.log(
      'Creating order with data:',
      JSON.stringify(createOrderDto, null, 2),
    );

    const { order_lines, order_addresses, order_payments, points_earned, ...orderData } = createOrderDto;

    try {
      const { user_id, ...orderDataWithoutUserId } = orderData;
      this.logger.log('user_id received:', user_id);
      if (!user_id) {
        throw new Error('user_id is required to create an order');
      }

      // Generate order_number and create the order using raw SQL
      const result: any[] = await this.prisma.$queryRaw`
        with counter as (
          insert into public.order_counters (date_key, last_value)
          values (to_char(now(), 'YYYYMMDDHH24MI'), 1)
          on conflict (date_key)
            do update set last_value = public.order_counters.last_value + 1
          returning last_value
        )
        insert into public.orders (user_id, total_amount, currency, status, earned_points, order_number)
        select
          ${user_id}::uuid,
          ${orderDataWithoutUserId.total_amount}::decimal(10,2),
          coalesce(${orderDataWithoutUserId.currency}, 'USD'),
          coalesce(${orderDataWithoutUserId.status}, 'pending')::order_states,
          ${points_earned || 0}::integer,
          to_char(now(), 'YYYYMMDDHH24MI') || lpad(counter.last_value::text, 3, '0')
        from counter
        returning *;
      `;

      const orderRecord = result[0];
      this.logger.log('Order created with order_number:', orderRecord.order_number);

      // Create order lines
      const orderLines = await Promise.all(
        order_lines.map(async (line) => {
          return await this.prisma.order_lines.create({
            data: {
              order_id: orderRecord.id,
              product_id: line.product_id,
              product_name: line.product_name,
              quantity: line.quantity,
              unit_price: line.unit_price,
            },
            include: {
              products: {
                select: {
                  image_url: true,
                  sku: true,
                },
              },
            },
          });
        })
      );

      // Create order addresses
      const orderAddresses = await Promise.all(
        order_addresses.map(async (address) => {
          return await this.prisma.order_addresses.create({
            data: {
              order_id: orderRecord.id,
              type: address.type,
              full_name: address.full_name,
              address_line1: address.address_line1,
              address_line2: address.address_line2,
              city: address.city,
              state: address.state,
              postal_code: address.postal_code,
              country: address.country,
              phone: address.phone,
            },
          });
        })
      );

      // Create order payments
      const orderPayments = await Promise.all(
        order_payments.map(async (payment) => {
          return await this.prisma.order_payments.create({
            data: {
              order_id: orderRecord.id,
              payment_method: payment.payment_method,
              amount: payment.amount,
              transaction_id: payment.transaction_id,
              metadata: payment.metadata,
            },
          });
        })
      );

      // Construct the complete order object
      const order = {
        ...orderRecord,
        order_lines: orderLines,
        order_addresses: orderAddresses,
        order_payments: orderPayments,
      };

      // If points were earned, create a points_ledger record and update user points
      if (points_earned && points_earned > 0) {
        try {
          // Create points_ledger record
          await this.prisma.points_ledger.create({
            data: {
              user_id,
              order_id: order.id,
              points: points_earned,
              type: 'EARN',
            },
          });

          // Update or create the user's total points in public_users table
          await this.prisma.public_users.upsert({
            where: { uuid: user_id },
            update: {
              points: {
                increment: points_earned,
              },
            },
            create: {
              uuid: user_id,
              points: points_earned,
            },
          });
        } catch (pointsError) {
          // Log the error but don't fail the order creation
          this.logger.error('Error updating points:', pointsError);
          // The order was created successfully, so we continue
        }
      }

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
                sku: true,
                iva: true,
                products_stock: { take: 1, select: { quantity: true } },
              },
            },
          },
        },
        order_addresses: true,
        order_payments: true,
        users: {
          include: {
            users: {
              select: {
                internal_id: true,
                first_name: true,
                last_name: true,
                trade_name: true,
              },
            },
            user_roles: {
              include: {
                roles: { select: { name: true } },
              },
            },
          } as any,
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.mapToOrderResponse(order);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderResponseDto> {
    this.logger.log(`Updating order ${id} with data:`, JSON.stringify(updateOrderDto, null, 2));

    // Verificar que la orden existe
    const existingOrder = await this.prisma.orders.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    try {
      // Prepare update data with proper date conversion
      const updateData: any = {
        ...updateOrderDto,
        updated_at: new Date(),
      };

      // Handle delivery_date conversion and null values
      if (updateOrderDto.delivery_date !== undefined) {
        updateData.delivery_date = updateOrderDto.delivery_date ? new Date(updateOrderDto.delivery_date) : null;
      }

      // Handle cancellation_date conversion and null values
      if (updateOrderDto.cancellation_date !== undefined) {
        updateData.cancellation_date = updateOrderDto.cancellation_date ? new Date(updateOrderDto.cancellation_date) : null;
      }

      const updatedOrder = await this.prisma.orders.update({
        where: { id },
        data: updateData,
        include: {
          order_lines: {
            include: {
              products: {
                select: {
                  image_url: true,
                  sku: true,
                  iva: true,
                },
              },
            },
          },
          order_addresses: true,
          order_payments: true,
          users: {
            include: {
              users: true,
              user_roles: {
                include: {
                  roles: { select: { name: true } },
                },
              },
            } as any,
          },
        },
      });

      this.logger.log(`Order ${id} updated successfully`);
      return this.mapToOrderResponse(updatedOrder);
    } catch (error) {
      this.logger.error(`Error updating order ${id}:`, error);
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<OrderResponseDto[]> {
    const orders = await this.prisma.orders.findMany({
      where: { user_id: userId },
      take: 100,
      include: {
        order_lines: {
          include: {
            products: {
              select: {
                image_url: true,
                sku: true,
                iva: true,
                products_stock: { take: 1, select: { quantity: true } },
              },
            },
          },
        },
        order_addresses: true,
        order_payments: true,
        users: {
          include: {
            users: {
              select: {
                internal_id: true,
                first_name: true,
                last_name: true,
                trade_name: true,
              },
            },
            user_roles: {
              include: {
                roles: { select: { name: true } },
              },
            },
          } as any,
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return orders.map(order => this.mapToOrderResponse(order));
  }

  async findAll(): Promise<OrderResponseDto[]> {
    const orders = await this.prisma.orders.findMany({
      take: 100,
      include: {
        order_lines: {
          include: {
            products: {
              select: {
                image_url: true,
                sku: true,
                iva: true,
                products_stock: { take: 1, select: { quantity: true } },
              },
            },
          },
        },
        order_addresses: true,
        order_payments: true,
        users: {
          include: {
            users: {
              select: {
                internal_id: true,
                first_name: true,
                last_name: true,
                trade_name: true,
              },
            },
            user_roles: {
              include: {
                roles: { select: { name: true } },
              },
            },
          } as any,
        },
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
                  sku: true,
                  iva: true,
                },
              },
            },
          },
          order_addresses: true,
          order_payments: true,
          users: {
            include: {
              users: true, // This includes public_users data
              user_roles: {
                include: {
                  roles: { select: { name: true } },
                },
              },
            } as any,
          },
        },
        orderBy,
      }),
      this.prisma.orders.count(),
    ]);
    return [orders.map((order) => this.mapToOrderResponse(order)), total];
  }

  async uploadDocument(
    file: Express.Multer.File,
    orderId: string,
    documentType: string = 'general',
  ): Promise<{ url: string; path: string }> {
    try {
      // Validar que la orden existe
      const order = await this.findOne(orderId);
      if (!order) {
        throw new NotFoundException('Orden no encontrada');
      }

      // Validar el archivo
      if (!file) {
        throw new Error('No se proporcionó ningún archivo');
      }

      // Validar el tipo de archivo (solo documentos)
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new Error('Tipo de archivo no permitido');
      }

      // Validar el tamaño del archivo (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('El archivo es demasiado grande. Máximo 10MB');
      }

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${orderId}_${documentType}_${timestamp}.${fileExtension}`;
      const filePath = `orders/${orderId}/${fileName}`;

      // Subir archivo a Supabase Storage
      const { data, error } = await this.databaseService.getAdminClient().storage
        .from('shingari')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        this.logger.error('Error uploading file to Supabase:', error);
        throw new Error('Error al subir el archivo');
      }

      // Obtener la URL pública del archivo
      const { data: urlData } = this.databaseService.getAdminClient().storage
        .from('shingari')
        .getPublicUrl(filePath);

      this.logger.log(`Document uploaded successfully: ${filePath}`);

      // Guardar la URL del archivo en la base de datos
      await this.prisma.orders.update({
        where: { id: orderId },
        data: {
          invoice_file_url: urlData.publicUrl,
        },
      });

      this.logger.log(`Invoice URL saved to database for order ${orderId}`);

      return {
        url: urlData.publicUrl,
        path: filePath,
      };
    } catch (error) {
      this.logger.error('Error in uploadDocument:', error);
      throw error;
    }
  }

  async deleteDocument(filePath: string): Promise<void> {
    try {
      const { error } = await this.databaseService.getAdminClient().storage
        .from('shingari')
        .remove([filePath]);

      if (error) {
        this.logger.error('Error deleting file from Supabase:', error);
        throw new Error('Error al eliminar el archivo');
      }

      this.logger.log(`Document deleted successfully: ${filePath}`);
    } catch (error) {
      this.logger.error('Error in deleteDocument:', error);
      throw error;
    }
  }

  async getTotalBilledByUserId(userId: string): Promise<number> {
    try {
      const result = await this.prisma.orders.aggregate({
        where: {
          user_id: userId,
        },
        _sum: {
          total_amount: true,
        },
      });

      return Number(result._sum.total_amount) || 0;
    } catch (error) {
      this.logger.error(`Error getting total billed for user ${userId}:`, error);
      return 0;
    }
  }

  async addOrderLine(
    orderId: string,
    dto: AddOrderLineDto,
    userId: string,
    isAdmin = false,
  ): Promise<OrderResponseDto> {
    const order = await this.assertOrderEditable(orderId);
    if (!isAdmin && order.user_id !== userId) {
      throw new ForbiddenException('No tienes permiso para editar esta orden');
    }

    const product = await this.prisma.products.findUnique({
      where: { id: dto.product_id },
    });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${dto.product_id} no encontrado`);
    }
    if (product.status !== 'active') {
      throw new BadRequestException('El producto no está disponible');
    }

    const unitPrice = await this.getUnitPriceForProduct(dto.product_id, order.user_id);

    const existingLine = await this.prisma.order_lines.findFirst({
      where: {
        order_id: orderId,
        product_id: dto.product_id,
      },
    });

    if (existingLine) {
      await this.prisma.order_lines.update({
        where: { id: existingLine.id },
        data: { quantity: existingLine.quantity + dto.quantity },
      });
    } else {
      await this.prisma.order_lines.create({
        data: {
          order_id: orderId,
          product_id: dto.product_id,
          product_name: product.name,
          quantity: dto.quantity,
          unit_price: unitPrice,
        },
      });
    }

    await this.recalculateTotals(orderId);
    return this.findOne(orderId);
  }

  async updateOrderLine(
    orderId: string,
    lineId: string,
    dto: UpdateOrderLineDto,
    userId: string,
    isAdmin = false,
  ): Promise<OrderResponseDto> {
    const order = await this.assertOrderEditable(orderId);
    if (!isAdmin && order.user_id !== userId) {
      throw new ForbiddenException('No tienes permiso para editar esta orden');
    }

    const line = await this.prisma.order_lines.findFirst({
      where: { id: lineId, order_id: orderId },
    });
    if (!line) {
      throw new NotFoundException('Línea de orden no encontrada');
    }

    await this.prisma.order_lines.update({
      where: { id: lineId },
      data: { quantity: dto.quantity },
    });

    await this.recalculateTotals(orderId);
    return this.findOne(orderId);
  }

  async removeOrderLine(
    orderId: string,
    lineId: string,
    userId: string,
    isAdmin = false,
  ): Promise<OrderResponseDto> {
    const order = await this.assertOrderEditable(orderId);
    if (!isAdmin && order.user_id !== userId) {
      throw new ForbiddenException('No tienes permiso para editar esta orden');
    }

    const lines = await this.prisma.order_lines.findMany({
      where: { order_id: orderId },
    });
    if (lines.length <= 1) {
      throw new BadRequestException('El pedido debe tener al menos un producto');
    }

    const line = lines.find((l) => l.id === lineId);
    if (!line) {
      throw new NotFoundException('Línea de orden no encontrada');
    }

    await this.prisma.order_lines.delete({
      where: { id: lineId },
    });

    await this.recalculateTotals(orderId);
    return this.findOne(orderId);
  }

  private async assertOrderEditable(orderId: string) {
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException(`Orden con ID ${orderId} no encontrada`);
    }
    const status = String(order.status || '').toLowerCase();
    if (!EDITABLE_STATUSES.includes(status)) {
      throw new BadRequestException('Este pedido no se puede editar');
    }
    return order;
  }

  private async recalculateTotals(orderId: string): Promise<void> {
    const lines = await this.prisma.order_lines.findMany({
      where: { order_id: orderId },
    });

    let total = 0;
    for (const line of lines) {
      const unitPrice = Number(line.unit_price);
      total += unitPrice * line.quantity;
    }
    total = Math.round(total * 100) / 100;

    const firstPayment = await this.prisma.order_payments.findFirst({
      where: { order_id: orderId },
    });

    await this.prisma.$transaction([
      this.prisma.orders.update({
        where: { id: orderId },
        data: {
          total_amount: total,
          updated_at: new Date(),
        },
      }),
      ...(firstPayment
        ? [
            this.prisma.order_payments.update({
              where: { id: firstPayment.id },
              data: { amount: total },
            }),
          ]
        : []),
    ]);
  }

  async isUserAdmin(userId: string): Promise<boolean> {
    const userRole = await this.prisma.user_roles.findFirst({
      where: {
        user_id: userId,
        roles: { name: 'admin' },
      },
    });
    return !!userRole;
  }

  private async getUnitPriceForProduct(
    productId: number,
    orderUserId: string,
  ): Promise<number> {
    const product = await this.prisma.products.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const userRole = await this.prisma.user_roles.findFirst({
      where: { user_id: orderUserId },
      include: { roles: { select: { name: true } } },
    });
    const isBusiness = userRole?.roles?.name === 'business';

    const discount = await this.prisma.products_discounts.findFirst({
      where: {
        product_id: productId,
        user_id: orderUserId,
        is_active: true,
        AND: [
          { OR: [{ valid_from: { lte: new Date() } }, { valid_from: null }] },
          { OR: [{ valid_to: { gte: new Date() } }, { valid_to: null }] },
        ],
      },
    });

    if (discount) {
      return Number(discount.price);
    }
    return isBusiness
      ? Number(product.wholesale_price)
      : Number(product.list_price);
  }

  private mapToOrderResponse(order: any): OrderResponseDto {
    const userIsBusiness =
      order.users?.user_roles?.some(
        (ur: { roles?: { name?: string } }) => ur.roles?.name === 'business',
      ) ?? false;
    const response = {
      id: order.id,
      user_id: order.user_id,
      user_email: order.users?.email || null,
      user_is_business: userIsBusiness,
      user_name: order.users?.users?.first_name && order.users?.users?.last_name
        ? `${order.users.users.first_name} ${order.users.users.last_name}`.trim()
        : order.users?.users?.trade_name || null,
      user_trade_name: order.users?.users?.trade_name || null,
      user_internal_id: order.users?.users?.internal_id ?? null,
      status: order.status,
      total_amount: order.total_amount,
      currency: order.currency,
      order_number: order.order_number || null,
      created_at: order.created_at,
      updated_at: order.updated_at,
      delivery_date: order.delivery_date || null,
      cancellation_reason: order.cancellation_reason || null,
      cancellation_date: order.cancellation_date || null,
      invoice_file_url: order.invoice_file_url || null,
      order_lines: order.order_lines.map((line: any) => {
        const ivaRaw = line.products?.iva;
        let productIva: number | null = null;
        if (ivaRaw != null) {
          const ivaNum = typeof ivaRaw === 'object' && ivaRaw.toNumber ? ivaRaw.toNumber() : Number(ivaRaw);
          productIva = ivaNum < 1 && ivaNum > 0 ? ivaNum * 100 : ivaNum;
        }
        const stockQty = line.products?.products_stock?.[0]?.quantity;
        const productStock =
          stockQty != null ? Number(stockQty) : undefined;
        return {
          id: line.id,
          product_id: line.product_id,
          product_name: line.product_name,
          quantity: line.quantity,
          unit_price: line.unit_price,
          total_price: line.total_price,
          product_image: line.products?.image_url || null,
          product_sku: line.products?.sku || null,
          product_iva: productIva,
          product_stock: productStock,
        };
      }),
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

    // Serialize BigInt values for JSON response
    return JSON.parse(
      JSON.stringify(response, (key, value) =>
        typeof value === 'bigint' ? Number(value) : value,
      ),
    ) as OrderResponseDto;
  }
}