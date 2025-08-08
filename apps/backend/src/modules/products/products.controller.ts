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
  Patch,
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
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { UpdateCategoriesOrderDto } from './dto/update-category.dto';
import { CreateProductTranslationDto } from './dto/create-product-translation.dto';
import { CreateCategoryTranslationDto } from './dto/create-category-translation.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Obtener una lista de todas las categorías de productos' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de categorías a retornar' })
  @ApiQuery({ name: 'locale', required: false, type: String, description: 'Locale for translations (es, zh)', example: 'es', default: 'es' })
  @ApiResponse({ status: 200, description: 'Lista de categorías obtenida exitosamente.', type: [ProductDiscountResponseDto] })
  async findAllCategories(
    @Query('limit') limit?: number,
    @Query('locale') locale: string = 'es',
  ) {
    return this.productsService.findAllCategories(limit, locale);
  }

  @Get('categories/parents')
  @ApiOperation({
    summary: 'Obtener solo las categorías padre (parent_id = null)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número máximo de categorías padre a retornar',
  })
  @ApiQuery({ name: 'locale', required: false, type: String, description: 'Locale for translations (es, zh)', example: 'es', default: 'es' })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías padre obtenida exitosamente.',
    type: [ProductDiscountResponseDto],
  })
  async findAllParentCategories(
    @Query('limit') limit?: number,
    @Query('locale') locale: string = 'es',
  ) {
    return this.productsService.findAllParentCategories(limit, locale);
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
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Cantidad de productos por página', example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Término de búsqueda (SKU, nombre, ID)', example: 'laptop' })
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

  // Temporary debug endpoint to check user role and clear cache
  @Get('debug/user-info')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Debug endpoint to check user role and clear cache' })
  async debugUserInfo(@NestRequest() req: any) {
    const userId: string = req.user.id;
    const userRole = await this.productsService.getUserRole(userId);
    await this.productsService.clearProductCache();
    return {
      userId,
      userRole,
      message: 'Cache cleared',
    };
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
  @ApiQuery({
    name: 'locale',
    description: 'Locale for translations (es, zh)',
    example: 'es',
    required: false,
    default: 'es',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles del producto obtenidos.',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async findOne(
    @Param('id') id: string,
    @Query('locale') locale: string = 'es',
    @NestRequest() req,
  ): Promise<ProductResponseDto> {
    return this.productsService.findOne(+id, req.user?.id, locale);
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva categoría (Solo Admin)' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Categoría creada exitosamente.', type: CategoryResponseDto })
  async createCategory(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return this.productsService.createCategory(dto);
  }

  @Put('categories/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una categoría existente (Solo Admin)' })
  @ApiParam({ name: 'id', description: 'ID de la categoría a actualizar', type: 'string' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, description: 'Categoría actualizada exitosamente.', type: CategoryResponseDto })
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    return this.productsService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una categoría (Solo Admin)' })
  @ApiParam({ name: 'id', description: 'ID de la categoría a eliminar', type: 'string' })
  @ApiResponse({ status: 204, description: 'Categoría eliminada exitosamente.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(@Param('id') id: string): Promise<void> {
    return this.productsService.deleteCategory(id);
  }

  @Patch('categories/order')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar el orden de múltiples categorías (Solo Admin)' })
  @ApiBody({ type: UpdateCategoriesOrderDto })
  @ApiResponse({ status: 200, description: 'Órdenes de categorías actualizadas exitosamente.' })
  async updateCategoriesOrder(@Body() dto: UpdateCategoriesOrderDto): Promise<void> {
    return this.productsService.updateCategoriesOrder(dto);
  }

  // Translation endpoints
  @Post(':id/translations')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear traducción para un producto (Solo Admin)' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: 'integer' })
  @ApiBody({ type: CreateProductTranslationDto })
  @ApiResponse({ status: 201, description: 'Traducción creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Ya existe una traducción para este idioma.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  @HttpCode(HttpStatus.CREATED)
  async createProductTranslation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProductTranslationDto,
  ): Promise<void> {
    return this.productsService.createProductTranslation(id, dto.locale, dto.name, dto.description);
  }

  @Put(':id/translations/:locale')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar traducción de un producto (Solo Admin)' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: 'integer' })
  @ApiParam({ name: 'locale', description: 'Locale de la traducción', example: 'zh' })
  @ApiBody({ type: CreateProductTranslationDto })
  @ApiResponse({ status: 200, description: 'Traducción actualizada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Traducción no encontrada.' })
  async updateProductTranslation(
    @Param('id', ParseIntPipe) id: number,
    @Param('locale') locale: string,
    @Body() dto: CreateProductTranslationDto,
  ): Promise<void> {
    return this.productsService.updateProductTranslation(id, locale, dto.name, dto.description);
  }

  @Delete(':id/translations/:locale')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar traducción de un producto (Solo Admin)' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: 'integer' })
  @ApiParam({ name: 'locale', description: 'Locale de la traducción', example: 'zh' })
  @ApiResponse({ status: 204, description: 'Traducción eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Traducción no encontrada.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProductTranslation(
    @Param('id', ParseIntPipe) id: number,
    @Param('locale') locale: string,
  ): Promise<void> {
    return this.productsService.deleteProductTranslation(id, locale);
  }

  @Post('categories/:id/translations')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear traducción para una categoría (Solo Admin)' })
  @ApiParam({ name: 'id', description: 'ID de la categoría', type: 'string' })
  @ApiBody({ type: CreateCategoryTranslationDto })
  @ApiResponse({ status: 201, description: 'Traducción creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Ya existe una traducción para este idioma.' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada.' })
  @HttpCode(HttpStatus.CREATED)
  async createCategoryTranslation(
    @Param('id') id: string,
    @Body() dto: CreateCategoryTranslationDto,
  ): Promise<void> {
    return this.productsService.createCategoryTranslation(Number(id), dto.locale, dto.name);
  }

  @Put('categories/:id/translations/:locale')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar traducción de una categoría (Solo Admin)' })
  @ApiParam({ name: 'id', description: 'ID de la categoría', type: 'string' })
  @ApiParam({ name: 'locale', description: 'Locale de la traducción', example: 'zh' })
  @ApiBody({ type: CreateCategoryTranslationDto })
  @ApiResponse({ status: 200, description: 'Traducción actualizada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Traducción no encontrada.' })
  async updateCategoryTranslation(
    @Param('id') id: string,
    @Param('locale') locale: string,
    @Body() dto: CreateCategoryTranslationDto,
  ): Promise<void> {
    return this.productsService.updateCategoryTranslation(Number(id), locale, dto.name);
  }

  @Delete('categories/:id/translations/:locale')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar traducción de una categoría (Solo Admin)' })
  @ApiParam({ name: 'id', description: 'ID de la categoría', type: 'string' })
  @ApiParam({ name: 'locale', description: 'Locale de la traducción', example: 'zh' })
  @ApiResponse({ status: 204, description: 'Traducción eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Traducción no encontrada.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategoryTranslation(
    @Param('id') id: string,
    @Param('locale') locale: string,
  ): Promise<void> {
    return this.productsService.deleteCategoryTranslation(Number(id), locale);
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
