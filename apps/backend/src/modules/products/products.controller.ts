import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Request as NestRequest,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { ProductResponseDto, PaginatedProductResponseDto } from './dto/product-response.dto';
import { ProductDiscountResponseDto } from './dto/product-discount-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard'; // Import AdminGuard desde auth/guards

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // --- Public Endpoint --- 
  @Get()
  @ApiOperation({ summary: 'Obtener lista pública de productos con paginación, búsqueda y filtros' })
  @ApiResponse({ status: 200, description: 'Lista de productos obtenida exitosamente.', type: PaginatedProductResponseDto })
  async findAllPublic(@Query() queryProductDto: QueryProductDto): Promise<PaginatedProductResponseDto> {
    return this.productsService.findAllPublic(queryProductDto);
  }

  // --- Admin Endpoints --- 
  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard) // Requiere autenticación y rol de administrador
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo producto (Solo Admin)' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente.', type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado (token no válido o ausente).' })
  @ApiResponse({ status: 403, description: 'Prohibido (usuario no es administrador).' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un producto existente (Solo Admin)' })
  @ApiParam({ name: 'id', description: 'ID del producto a actualizar', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Producto actualizado exitosamente.', type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar lógicamente un producto (Solo Admin)' })
  @ApiParam({ name: 'id', description: 'ID del producto a eliminar', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Producto eliminado lógicamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeLogical(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productsService.removeLogical(id);
  }

  // --- User-Specific Endpoint --- 
  @Get('discounts')
  @UseGuards(JwtAuthGuard) // Requiere autenticación
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener descuentos de productos para el usuario autenticado' })
  @ApiQuery({ name: 'productId', description: 'ID opcional del producto para filtrar descuentos', required: false, type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Lista de descuentos obtenida.', type: [ProductDiscountResponseDto] })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async findDiscountsForUser(
    @NestRequest() req, // Para obtener req.user.id
    @Query('productId', new ParseUUIDPipe({ optional: true })) productId?: string,
  ): Promise<ProductDiscountResponseDto[]> {
    const userId = req.user.id;
    return this.productsService.findDiscountsForUser(userId, productId);
  }
  
  // Endpoint para obtener un producto específico por ID (público)
  // Es buena práctica tener un endpoint para obtener detalles de un solo producto.
  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de un producto específico por su ID' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Detalles del producto obtenidos.', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }
} 