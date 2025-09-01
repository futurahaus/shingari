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
  ParseIntPipe,
  Request as NestRequest,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { QueryRewardDto } from './dto/query-reward.dto';
import { RewardResponseDto, PaginatedRewardsResponseDto } from './dto/reward-response.dto';
import { RedeemRewardsDto } from './dto/redeem-rewards.dto';
import { RedemptionResponseDto } from './dto/redemption-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Rewards')
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  // --- Public Endpoints ---
  @Get('public')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener lista pública de recompensas disponibles para canjear',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número máximo de recompensas a retornar',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de recompensas públicas obtenida exitosamente.',
    type: [RewardResponseDto],
  })
  async findPublicRewards(@Query('limit') limit?: number) {
    return this.rewardsService.findPublicRewards(limit);
  }

  @Get('public/:id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener una recompensa pública específica por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la recompensa',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Recompensa obtenida exitosamente.',
    type: RewardResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Recompensa no encontrada.',
  })
  async findPublicOne(@Param('id', ParseIntPipe) id: number) {
    return this.rewardsService.findOne(id);
  }

  // --- Admin Endpoints ---
  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear una nueva recompensa (requiere permisos de administrador)',
  })
  @ApiBody({
    type: CreateRewardDto,
    description: 'Datos de la recompensa a crear',
  })
  @ApiResponse({
    status: 201,
    description: 'Recompensa creada exitosamente.',
    type: RewardResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado. Se requieren permisos de administrador.',
  })
  async create(@Body() createRewardDto: CreateRewardDto): Promise<RewardResponseDto> {
    return this.rewardsService.create(createRewardDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener lista de recompensas con paginación, búsqueda y filtros (requiere permisos de administrador)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de elementos por página',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Término de búsqueda para filtrar por nombre o descripción',
    example: 'cupón descuento',
  })
  @ApiQuery({
    name: 'sortField',
    required: false,
    type: String,
    description: 'Campo por el cual ordenar',
    enum: ['created_at', 'updated_at', 'name', 'points_cost'],
    example: 'created_at',
  })
  @ApiQuery({
    name: 'sortDirection',
    required: false,
    type: String,
    description: 'Dirección del ordenamiento',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @ApiQuery({
    name: 'minPoints',
    required: false,
    type: Number,
    description: 'Filtrar por costo mínimo de puntos',
    example: 50,
  })
  @ApiQuery({
    name: 'maxPoints',
    required: false,
    type: Number,
    description: 'Filtrar por costo máximo de puntos',
    example: 200,
  })
  @ApiQuery({
    name: 'inStock',
    required: false,
    type: Boolean,
    description: 'Filtrar por disponibilidad de stock',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de recompensas obtenida exitosamente.',
    type: PaginatedRewardsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado. Se requieren permisos de administrador.',
  })
  async findAll(@Query() query: QueryRewardDto): Promise<PaginatedRewardsResponseDto> {
    return this.rewardsService.findAll(query);
  }

  @Get('my-redemptions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener historial de canjes del usuario',
    description: 'Devuelve todos los canjes realizados por el usuario autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de canjes obtenido exitosamente.',
    type: [RedemptionResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado.',
  })
  async getUserRedemptions(@NestRequest() req: any): Promise<RedemptionResponseDto[]> {
    const userId = req.user.sub;
    return this.rewardsService.getUserRedemptions(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener una recompensa específica por ID (requiere permisos de administrador)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la recompensa',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Recompensa obtenida exitosamente.',
    type: RewardResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado. Se requieren permisos de administrador.',
  })
  @ApiResponse({
    status: 404,
    description: 'Recompensa no encontrada.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<RewardResponseDto> {
    return this.rewardsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar una recompensa existente (requiere permisos de administrador)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la recompensa',
    example: 1,
  })
  @ApiBody({
    type: UpdateRewardDto,
    description: 'Datos de la recompensa a actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Recompensa actualizada exitosamente.',
    type: RewardResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado. Se requieren permisos de administrador.',
  })
  @ApiResponse({
    status: 404,
    description: 'Recompensa no encontrada.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRewardDto: UpdateRewardDto,
  ): Promise<RewardResponseDto> {
    return this.rewardsService.update(id, updateRewardDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar una recompensa (requiere permisos de administrador)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la recompensa',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Recompensa eliminada exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar la recompensa porque está siendo utilizada.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado. Se requieren permisos de administrador.',
  })
  @ApiResponse({
    status: 404,
    description: 'Recompensa no encontrada.',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.rewardsService.remove(id);
  }

  // --- Utility Endpoints ---
  @Get(':id/stock')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verificar el stock disponible de una recompensa (requiere permisos de administrador)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la recompensa',
    example: 1,
  })
  @ApiQuery({
    name: 'quantity',
    required: false,
    type: Number,
    description: 'Cantidad a verificar',
    example: 1,
    default: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Stock verificado exitosamente.',
    schema: {
      type: 'object',
      properties: {
        available: { type: 'boolean' },
        currentStock: { type: 'number', nullable: true },
        requestedQuantity: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado. Se requieren permisos de administrador.',
  })
  @ApiResponse({
    status: 404,
    description: 'Recompensa no encontrada.',
  })
  async checkStock(
    @Param('id', ParseIntPipe) id: number,
    @Query('quantity') quantity: number = 1,
  ) {
    const reward = await this.rewardsService.findOne(id);
    const available = await this.rewardsService.checkStock(id, quantity);
    
    return {
      available,
      currentStock: reward.stock,
      requestedQuantity: quantity,
    };
  }

  @Post('upload-image')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir imagen de recompensa a Supabase Storage (Solo Admin)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Imagen subida exitosamente.', 
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL pública de la imagen' },
        path: { type: 'string', description: 'Ruta del archivo en el bucket' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Archivo no válido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido - Se requiere acceso de administrador.' })
  @HttpCode(HttpStatus.CREATED)
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo.');
    }
    return this.rewardsService.uploadImage(file);
  }

  @Delete('images/:filePath')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar imagen de recompensa de Supabase Storage (Solo Admin)' })
  @ApiParam({ name: 'filePath', description: 'Ruta del archivo a eliminar', example: 'rewards/image_123.jpg' })
  @ApiResponse({ status: 204, description: 'Imagen eliminada exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido - Se requiere acceso de administrador.' })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteImage(@Param('filePath') filePath: string): Promise<void> {
    return this.rewardsService.deleteImage(filePath);
  }

  // --- User Redemption Endpoints ---
  @Post('redeem')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Canjear recompensas por puntos',
    description: 'Permite a un usuario autenticado canjear una o más recompensas usando sus puntos acumulados.',
  })
  @ApiBody({
    type: RedeemRewardsDto,
    description: 'Datos del canje de recompensas',
  })
  @ApiResponse({
    status: 201,
    description: 'Canje procesado exitosamente.',
    type: RedemptionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos, puntos insuficientes o stock insuficiente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Una o más recompensas no encontradas.',
  })
  async redeemRewards(
    @Body() redeemData: RedeemRewardsDto,
    @NestRequest() req: any,
  ): Promise<RedemptionResponseDto> {
    console.log('🔍 Controller Debug - Request:', {
      hasUser: !!req.user,
      user: req.user,
      headers: req.headers,
      authorization: req.headers.authorization?.substring(0, 20) + '...'
    });
    
    const userId = req.user?.sub || req.user?.id;
    console.log('🔍 Controller Debug - Extracted userId:', userId);
    
    return this.rewardsService.redeemRewards(userId, redeemData);
  }
}
