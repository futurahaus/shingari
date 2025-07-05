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
  ParseIntPipe,
  Request as NestRequest,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import {
  ProductResponseDto,
  PaginatedProductResponseDto,
} from './dto/product-response.dto';
import { ProductDiscountResponseDto } from './dto/product-discount-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard'; // Import AdminGuard desde auth/guards
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Obtener una lista de todas las categorías de productos' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de categorías a retornar' })
  @ApiResponse({ status: 200, description: 'Lista de categorías obtenida exitosamente.', type: [ProductDiscountResponseDto] })
  async findAllCategories(@Query('limit') limit?: number) {
    return this.productsService.findAllCategories(limit);
  }

  // --- Public Endpoint ---
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary:
      'Obtener lista pública de productos con paginación, búsqueda y filtros',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos obtenida exitosamente.',
    type: PaginatedProductResponseDto,
  })
  async findAllPublic(
    @Query() queryProductDto: QueryProductDto,
    @NestRequest() req,
  ): Promise<PaginatedProductResponseDto> {
    return this.productsService.findAllPublic(queryProductDto, req.user?.id);
  }

  // --- Admin Endpoints ---
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener productos paginados (Solo Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos paginada obtenida exitosamente.',
    type: PaginatedProductResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Se requiere acceso de administrador.',
  })
  async findAllForAdmin(
    @Query() queryProductDto: QueryProductDto,
  ): Promise<PaginatedProductResponseDto> {
    return this.productsService.findAllForAdmin(queryProductDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard) // Requiere autenticación y rol de administrador
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo producto (Solo Admin)' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Producto creado exitosamente.',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado (token no válido o ausente).',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido (usuario no es administrador).',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un producto existente (Solo Admin)' })
  @ApiParam({
    name: 'id',
    description: 'ID del producto a actualizar',
    type: 'integer',
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado exitosamente.',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id.toString(), updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar lógicamente un producto (Solo Admin)' })
  @ApiParam({
    name: 'id',
    description: 'ID del producto a eliminar',
    type: 'integer',
  })
  @ApiResponse({ status: 204, description: 'Producto eliminado lógicamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeLogical(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.productsService.removeLogical(id.toString());
  }

  // --- User-Specific Endpoint ---
  @Get('discounts')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener descuentos de productos para el usuario autenticado',
  })
  @ApiQuery({
    name: 'productId',
    description: 'ID numérico opcional del producto para filtrar descuentos',
    required: false,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de descuentos obtenida.',
    type: [ProductDiscountResponseDto],
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async findDiscountsForUser(
    @NestRequest() req,
  ): Promise<ProductDiscountResponseDto[]> {
    return this.productsService.findDiscountsForUser(req.user.id);
  }

  // Endpoint para obtener un producto específico por ID (público)
  // Es buena práctica tener un endpoint para obtener detalles de un solo producto.
  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener detalles de un producto específico por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID numérico del producto',
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles del producto obtenidos.',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async findOne(
    @Param('id') id: string,
    @NestRequest() req,
  ): Promise<ProductResponseDto> {
    return this.productsService.findOne(+id, req.user?.id);
  }

  // @Post('upload-image')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  // @UseInterceptors(FileInterceptor('file'))
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Subir imagen a Supabase Storage (Solo Admin)' })
  // @ApiResponse({ status: 201, description: 'URL de la imagen subida.' })
  // @ApiResponse({ status: 400, description: 'Archivo no válido.' })
  // async uploadImage(@UploadedFile() file: Express.Multer.File) {
  //   if (!file) {
  //     throw new BadRequestException('No se proporcionó ningún archivo.');
  //   }
  //   // Use the productsService to handle the upload
  //   return this.productsService.uploadImageToSupabase(file);
  // }

  // @Post(':id/discounts')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Crear un descuento para un producto (Solo Admin)' })
  // @ApiResponse({ status: 201, description: 'Descuento creado.', type: ProductDiscountResponseDto })
  // async createDiscount(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() dto: any // Replace with CreateDiscountDto if available
  // ): Promise<ProductDiscountResponseDto> {
  //   return this.productsService.createDiscount(id, dto);
  // }

  // @Get(':id/discounts')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Listar descuentos de un producto (Solo Admin)' })
  // @ApiResponse({ status: 200, description: 'Lista de descuentos.', type: [ProductDiscountResponseDto] })
  // async getDiscountsForProduct(
  //   @Param('id', ParseIntPipe) id: number
  // ): Promise<ProductDiscountResponseDto[]> {
  //   return this.productsService.getDiscountsForProduct(id);
  // }

  // @Put('discounts/:discountId')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Actualizar un descuento (Solo Admin)' })
  // @ApiResponse({ status: 200, description: 'Descuento actualizado.', type: ProductDiscountResponseDto })
  // async updateDiscount(
  //   @Param('discountId', ParseIntPipe) discountId: number,
  //   @Body() dto: any // Replace with UpdateDiscountDto if available
  // ): Promise<ProductDiscountResponseDto> {
  //   return this.productsService.updateDiscount(discountId, dto);
  // }

  // @Delete('discounts/:discountId')
  // @UseGuards(JwtAuthGuard, AdminGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Eliminar un descuento (Solo Admin)' })
  // @ApiResponse({ status: 204, description: 'Descuento eliminado.' })
  // async deleteDiscount(
  //   @Param('discountId', ParseIntPipe) discountId: number
  // ): Promise<void> {
  //   return this.productsService.deleteDiscount(discountId);
  // }
}
