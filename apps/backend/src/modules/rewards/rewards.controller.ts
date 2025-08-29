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
} from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { QueryRewardDto } from './dto/query-reward.dto';
import { RewardResponseDto, PaginatedRewardsResponseDto } from './dto/reward-response.dto';
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
import { AdminGuard } from '../auth/guards/admin.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

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
}
