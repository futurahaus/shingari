import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request as NestRequest,
    ParseUUIDPipe,
    Logger,
    BadRequestException,
    Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
    private readonly logger = new Logger(OrdersController.name);

    constructor(private readonly ordersService: OrdersService) { }

    @Get('user/me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener todas las órdenes del usuario autenticado' })
    @ApiResponse({
        status: 200,
        description: 'Órdenes del usuario obtenidas exitosamente.',
        type: [OrderResponseDto],
    })
    async findMyOrders(@NestRequest() req): Promise<OrderResponseDto[]> {
        return this.ordersService.findByUserId(req.user.id);
    }

    @Get('admin/all')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener todas las órdenes (admin)' })
    @ApiResponse({
        status: 200,
        description: 'Órdenes obtenidas exitosamente.',
        type: [OrderResponseDto],
    })
    async findAllOrdersForAdmin(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
        @Query('sortField') sortField: string = 'created_at',
        @Query('sortDirection') sortDirection: 'asc' | 'desc' = 'desc',
    ): Promise<any> {
        const [orders, total] = await this.ordersService.findAllPaginated(page, limit, sortField, sortDirection);
        return {
            data: orders,
            total,
            page,
            limit,
            lastPage: Math.ceil(total / limit),
        };
    }

    @Get(':id')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: 'Obtener una orden por ID' })
    @ApiParam({ name: 'id', description: 'ID de la orden' })
    @ApiResponse({
        status: 200,
        description: 'Orden obtenida exitosamente.',
        type: OrderResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Orden no encontrada.',
    })
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<OrderResponseDto> {
        return this.ordersService.findOne(id);
    }

    @Post()
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: 'Crear una nueva orden' })
    @ApiBody({ type: CreateOrderDto })
    @ApiResponse({
        status: 201,
        description: 'Orden creada exitosamente.',
        type: OrderResponseDto,
    })
    async create(
        @Body() createOrderDto: CreateOrderDto,
        @NestRequest() req,
    ): Promise<OrderResponseDto> {
        this.logger.log('Received order creation request');
        this.logger.log('Request body:', JSON.stringify(createOrderDto, null, 2));

        try {
            // Si hay un usuario autenticado, usar su ID
            if (req.user?.id) {
                createOrderDto.user_id = req.user.id;
                this.logger.log('User authenticated, using user_id:', req.user.id);
            } else {
                this.logger.log('No authenticated user');
            }

            const result = await this.ordersService.create(createOrderDto);
            this.logger.log('Order created successfully:', result.id);
            return result;
        } catch (error) {
            this.logger.error('Error creating order:', error);
            throw error;
        }
    }
} 