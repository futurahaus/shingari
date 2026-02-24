import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Request as NestRequest,
    ParseUUIDPipe,
    Logger,
    BadRequestException,
    Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AddOrderLineDto } from './dto/add-order-line.dto';
import { UpdateOrderLineDto } from './dto/update-order-line.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { DocumentUploadResponseDto } from './dto/document-upload-response.dto';
import { MailService } from '../mail/mail.service';
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

    constructor(
        private readonly ordersService: OrdersService,
        private readonly mailService: MailService,
    ) { }

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
            
            // Enviar notificación al admin (email + WhatsApp)
            try {
                await this.mailService.sendOrderNotification(result, req.user?.id);
                this.logger.log('Admin notification sent successfully');
            } catch (notificationError) {
                this.logger.error('Error sending admin notification:', notificationError);
                // No lanzamos el error para no afectar la creación de la orden
            }
            
            return result;
        } catch (error) {
            this.logger.error('Error creating order:', error);
            throw error;
        }
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Actualizar una orden existente' })
    @ApiParam({ name: 'id', description: 'ID de la orden a actualizar' })
    @ApiBody({ type: UpdateOrderDto })
    @ApiResponse({
        status: 200,
        description: 'Orden actualizada exitosamente.',
        type: OrderResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Orden no encontrada.',
    })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateOrderDto: UpdateOrderDto,
    ): Promise<OrderResponseDto> {
        this.logger.log(`Received order update request for ID: ${id}`);
        this.logger.log('Update data:', JSON.stringify(updateOrderDto, null, 2));

        try {
            const result = await this.ordersService.update(id, updateOrderDto);
            this.logger.log(`Order ${id} updated successfully`);
            return result;
        } catch (error) {
            this.logger.error(`Error updating order ${id}:`, error);
            throw error;
        }
    }

    @Post(':id/lines')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Añadir producto a una orden' })
    @ApiParam({ name: 'id', description: 'ID de la orden' })
    @ApiBody({ type: AddOrderLineDto })
    @ApiResponse({ status: 200, description: 'Producto añadido. Orden actualizada.', type: OrderResponseDto })
    @ApiResponse({ status: 400, description: 'Pedido no editable o producto no disponible.' })
    @ApiResponse({ status: 403, description: 'Sin permiso para editar esta orden.' })
    @ApiResponse({ status: 404, description: 'Orden o producto no encontrado.' })
    async addOrderLine(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: AddOrderLineDto,
        @NestRequest() req,
    ): Promise<OrderResponseDto> {
        const isAdmin = await this.ordersService.isUserAdmin(req.user.id);
        return this.ordersService.addOrderLine(id, dto, req.user.id, isAdmin);
    }

    @Patch(':id/lines/:lineId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Actualizar cantidad de un producto en la orden' })
    @ApiParam({ name: 'id', description: 'ID de la orden' })
    @ApiParam({ name: 'lineId', description: 'ID de la línea de orden' })
    @ApiBody({ type: UpdateOrderLineDto })
    @ApiResponse({ status: 200, description: 'Cantidad actualizada.', type: OrderResponseDto })
    @ApiResponse({ status: 400, description: 'Pedido no editable.' })
    @ApiResponse({ status: 403, description: 'Sin permiso para editar esta orden.' })
    @ApiResponse({ status: 404, description: 'Orden o línea no encontrada.' })
    async updateOrderLine(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('lineId', ParseUUIDPipe) lineId: string,
        @Body() dto: UpdateOrderLineDto,
        @NestRequest() req,
    ): Promise<OrderResponseDto> {
        const isAdmin = await this.ordersService.isUserAdmin(req.user.id);
        return this.ordersService.updateOrderLine(id, lineId, dto, req.user.id, isAdmin);
    }

    @Delete(':id/lines/:lineId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Eliminar producto de una orden' })
    @ApiParam({ name: 'id', description: 'ID de la orden' })
    @ApiParam({ name: 'lineId', description: 'ID de la línea de orden' })
    @ApiResponse({ status: 200, description: 'Producto eliminado. Orden actualizada.', type: OrderResponseDto })
    @ApiResponse({ status: 400, description: 'Pedido no editable o debe tener al menos un producto.' })
    @ApiResponse({ status: 403, description: 'Sin permiso para editar esta orden.' })
    @ApiResponse({ status: 404, description: 'Orden o línea no encontrada.' })
    async removeOrderLine(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('lineId', ParseUUIDPipe) lineId: string,
        @NestRequest() req,
    ): Promise<OrderResponseDto> {
        const isAdmin = await this.ordersService.isUserAdmin(req.user.id);
        return this.ordersService.removeOrderLine(id, lineId, req.user.id, isAdmin);
    }

    @Post(':id/upload-document')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Subir documento para una orden específica' })
    @ApiParam({ name: 'id', description: 'ID de la orden' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Archivo a subir (PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF)',
                },
                documentType: {
                    type: 'string',
                    description: 'Tipo de documento (opcional, por defecto: general)',
                    example: 'invoice',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Documento subido exitosamente.',
        type: DocumentUploadResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Archivo no válido o error en la subida.',
    })
    @ApiResponse({
        status: 404,
        description: 'Orden no encontrada.',
    })
    async uploadDocument(
        @Param('id', ParseUUIDPipe) orderId: string,
        @UploadedFile() file: Express.Multer.File,
        @Body('documentType') documentType: string = 'general',
    ) {
        this.logger.log(`Received document upload request for order ID: ${orderId}`);
        this.logger.log('File info:', {
            originalname: file?.originalname,
            mimetype: file?.mimetype,
            size: file?.size,
        });

        try {
            const result = await this.ordersService.uploadDocument(file, orderId, documentType);
            this.logger.log(`Document uploaded successfully for order ${orderId}`);
            return result;
        } catch (error) {
            this.logger.error(`Error uploading document for order ${orderId}:`, error);
            throw error;
        }
    }

    @Delete(':id/documents/:filePath')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Eliminar documento de una orden' })
    @ApiParam({ name: 'id', description: 'ID de la orden' })
    @ApiParam({ name: 'filePath', description: 'Ruta del archivo a eliminar' })
    @ApiResponse({
        status: 200,
        description: 'Documento eliminado exitosamente.',
    })
    @ApiResponse({
        status: 404,
        description: 'Orden o archivo no encontrado.',
    })
    async deleteDocument(
        @Param('id', ParseUUIDPipe) orderId: string,
        @Param('filePath') filePath: string,
    ) {
        this.logger.log(`Received document deletion request for order ID: ${orderId}, file: ${filePath}`);

        try {
            await this.ordersService.deleteDocument(filePath);
            this.logger.log(`Document deleted successfully for order ${orderId}`);
            return { message: 'Documento eliminado exitosamente' };
        } catch (error) {
            this.logger.error(`Error deleting document for order ${orderId}:`, error);
            throw error;
        }
    }
} 