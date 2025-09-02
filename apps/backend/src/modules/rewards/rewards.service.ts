import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { QueryRewardDto } from './dto/query-reward.dto';
import { RewardResponseDto, PaginatedRewardsResponseDto } from './dto/reward-response.dto';
import { RedeemRewardsDto } from './dto/redeem-rewards.dto';
import { RedemptionResponseDto } from './dto/redemption-response.dto';
import { rewards as RewardPrismaType } from '../../../generated/prisma';
import { DatabaseService } from 'src/modules/database/database.service';

@Injectable()
export class RewardsService {
  private readonly logger = new Logger(RewardsService.name);

  constructor(private readonly prisma: PrismaService, private readonly databaseService: DatabaseService) {}

  async create(createRewardDto: CreateRewardDto): Promise<RewardResponseDto> {
    try {
      this.logger.log(`Creating new reward: ${createRewardDto.name}`);

      const reward = await this.prisma.rewards.create({
        data: {
          name: createRewardDto.name,
          description: createRewardDto.description,
          image_url: createRewardDto.image_url,
          points_cost: createRewardDto.points_cost,
          stock: createRewardDto.stock ?? 0,
        },
      });

      this.logger.log(`Reward created successfully with ID: ${reward.id}`);
      return this.mapToResponseDto(reward);
    } catch (error) {
      this.logger.error(`Error creating reward: ${error.message}`, error.stack);
      throw new BadRequestException('Error al crear la recompensa');
    }
  }

  async findAll(query: QueryRewardDto): Promise<PaginatedRewardsResponseDto> {
    try {
      const { page = 1, limit = 10, search, sortField = 'created_at', sortDirection = 'desc', minPoints, maxPoints, inStock } = query;

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (minPoints !== undefined) {
        where.points_cost = { ...where.points_cost, gte: minPoints };
      }

      if (maxPoints !== undefined) {
        where.points_cost = { ...where.points_cost, lte: maxPoints };
      }

      if (inStock !== undefined) {
        if (inStock) {
          where.OR = [
            { stock: { gt: 0 } },
            { stock: null }, // null means unlimited
          ];
        } else {
          where.stock = 0;
        }
      }

      // Build orderBy clause
      const orderBy: any = {};
      if (sortField === 'name') {
        orderBy.name = sortDirection;
      } else if (sortField === 'points_cost') {
        orderBy.points_cost = sortDirection;
      } else {
        orderBy[sortField] = sortDirection;
      }

      // Get total count
      const total = await this.prisma.rewards.count({ where });

      // Calculate pagination
      const skip = (page - 1) * limit;
      const lastPage = Math.ceil(total / limit);

      // Get rewards with pagination
      const rewards = await this.prisma.rewards.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      });

      this.logger.log(`Found ${rewards.length} rewards out of ${total} total`);

      return {
        rewards: rewards.map(reward => this.mapToResponseDto(reward)),
        total,
        page,
        limit,
        lastPage,
      };
    } catch (error) {
      this.logger.error(`Error finding rewards: ${error.message}`, error.stack);
      throw new BadRequestException('Error al obtener las recompensas');
    }
  }

  async findOne(id: number): Promise<RewardResponseDto> {
    try {
      this.logger.log(`Finding reward with ID: ${id}`);

      const reward = await this.prisma.rewards.findUnique({
        where: { id },
      });

      if (!reward) {
        throw new NotFoundException(`Recompensa con ID ${id} no encontrada`);
      }

      return this.mapToResponseDto(reward);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding reward ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Error al obtener la recompensa');
    }
  }

  async update(id: number, updateRewardDto: UpdateRewardDto): Promise<RewardResponseDto> {
    try {
      this.logger.log(`Updating reward with ID: ${id}`);

      // Check if reward exists
      const existingReward = await this.prisma.rewards.findUnique({
        where: { id },
      });

      if (!existingReward) {
        throw new NotFoundException(`Recompensa con ID ${id} no encontrada`);
      }

      // Validate points_cost if it's being updated
      if (updateRewardDto.points_cost !== undefined && updateRewardDto.points_cost <= 0) {
        throw new BadRequestException('El costo en puntos debe ser mayor a 0');
      }

      // Validate stock if it's being updated
      if (updateRewardDto.stock !== undefined && updateRewardDto.stock < 0) {
        throw new BadRequestException('El stock no puede ser negativo');
      }

      const updatedReward = await this.prisma.rewards.update({
        where: { id },
        data: {
          ...updateRewardDto,
        },
      });

      this.logger.log(`Reward ${id} updated successfully`);
      return this.mapToResponseDto(updatedReward);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error updating reward ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Error al actualizar la recompensa');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      this.logger.log(`Removing reward with ID: ${id}`);

      // Check if reward exists
      const existingReward = await this.prisma.rewards.findUnique({
        where: { id },
      });

      if (!existingReward) {
        throw new NotFoundException(`Recompensa con ID ${id} no encontrada`);
      }

      // Check if reward is being used in points_ledger
      const pointsLedgerEntries = await this.prisma.points_ledger.findMany({
        where: { reward_id: id },
      });

      if (pointsLedgerEntries.length > 0) {
        throw new BadRequestException(
          'No se puede eliminar la recompensa porque está siendo utilizada en transacciones de puntos'
        );
      }

      await this.prisma.rewards.delete({
        where: { id },
      });

      this.logger.log(`Reward ${id} removed successfully`);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error removing reward ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Error al eliminar la recompensa');
    }
  }

  async findPublicRewards(limit?: number): Promise<RewardResponseDto[]> {
    try {
      this.logger.log(`Finding public rewards with limit: ${limit || 'unlimited'}`);

      const where = {
        OR: [
          { stock: { gt: 0 } },
          { stock: null }, // null means unlimited
        ],
      };

      const rewards = await this.prisma.rewards.findMany({
        where,
        orderBy: { points_cost: 'asc' },
        take: limit,
      });

      this.logger.log(`Found ${rewards.length} public rewards`);
      return rewards.map(reward => this.mapToResponseDto(reward));
    } catch (error) {
      this.logger.error(`Error finding public rewards: ${error.message}`, error.stack);
      throw new BadRequestException('Error al obtener las recompensas públicas');
    }
  }

  async checkStock(id: number, quantity: number = 1): Promise<boolean> {
    try {
      const reward = await this.prisma.rewards.findUnique({
        where: { id },
        select: { stock: true },
      });

      if (!reward) {
        return false;
      }

      // If stock is null, it means unlimited
      if (reward.stock === null) {
        return true;
      }

      return reward.stock >= quantity;
    } catch (error) {
      this.logger.error(`Error checking stock for reward ${id}: ${error.message}`, error.stack);
      return false;
    }
  }

  async updateStock(id: number, quantity: number, operation: 'add' | 'subtract'): Promise<void> {
    try {
      this.logger.log(`Updating stock for reward ${id}: ${operation} ${quantity}`);

      const reward = await this.prisma.rewards.findUnique({
        where: { id },
        select: { stock: true },
      });

      if (!reward) {
        throw new NotFoundException(`Recompensa con ID ${id} no encontrada`);
      }

      // If stock is null, it means unlimited, so no need to update
      if (reward.stock === null) {
        return;
      }

      let newStock: number;
      if (operation === 'add') {
        newStock = reward.stock + quantity;
      } else {
        newStock = Math.max(0, reward.stock - quantity);
      }

      await this.prisma.rewards.update({
        where: { id },
        data: { stock: newStock },
      });

      this.logger.log(`Stock updated for reward ${id}: ${newStock}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating stock for reward ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Error al actualizar el stock de la recompensa');
    }
  }

  private mapToResponseDto(reward: RewardPrismaType): RewardResponseDto {
    return {
      id: reward.id,
      name: reward.name,
      description: reward.description,
      image_url: reward.image_url,
      points_cost: reward.points_cost,
      stock: reward.stock,
      created_at: reward.created_at,
      updated_at: reward.updated_at || reward.created_at,
    };
  }

  async uploadImage(file: Express.Multer.File): Promise<{ url: string; path: string }> {
    try {
      // Validar el archivo
      if (!file) {
        throw new BadRequestException('No se proporcionó ningún archivo.');
      }

      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException('Tipo de archivo no válido. Solo se permiten imágenes JPEG, PNG y WebP.');
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new BadRequestException('El archivo es demasiado grande. El tamaño máximo es 5MB.');
      }

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `reward_image_${timestamp}.${fileExtension}`;
      const filePath = `rewards/${fileName}`;

      // Subir archivo a Supabase Storage
      const { error } = await this.databaseService.getAdminClient().storage
        .from('shingari')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
        });

      if (error) {
        this.logger.error('Error uploading image to Supabase:', error);
        throw new Error('Error al subir la imagen');
      }

      // Obtener la URL pública del archivo
      const { data: urlData } = this.databaseService.getAdminClient().storage
        .from('shingari')
        .getPublicUrl(filePath);

      this.logger.log(`Image uploaded successfully: ${filePath}`);

      return {
        url: urlData.publicUrl,
        path: filePath,
      };
    } catch (error) {
      this.logger.error('Error in uploadImage:', error);
      throw error;
    }
  }

  async deleteImage(filePath: string): Promise<void> {
    try {
      const { error } = await this.databaseService.getAdminClient().storage
        .from('shingari')
        .remove([filePath]);

      if (error) {
        this.logger.error('Error deleting image from Supabase:', error);
        throw new Error('Error al eliminar la imagen');
      }

      this.logger.log(`Image deleted successfully: ${filePath}`);
    } catch (error) {
      this.logger.error('Error in deleteImage:', error);
      throw error;
    }
  }

  async redeemRewards(userId: string, redeemData: RedeemRewardsDto): Promise<RedemptionResponseDto> {
    try {
      this.logger.log(`Processing redemption for user: ${userId}`);

      // Start a transaction
      return await this.prisma.$transaction(async (prisma) => {
        // 1. Get user's current points
        const userPointsBalance = await prisma.$queryRaw<Array<{ total_points: number }>>`
          SELECT COALESCE(SUM(points), 0) as total_points 
          FROM points_ledger 
          WHERE user_id = ${userId}::uuid
        `;

        const currentPoints = userPointsBalance[0]?.total_points || 0;

        this.logger.log(`🔍 Backend Debug - Points Validation:`, {
          userId,
          currentPoints,
          requestedPoints: redeemData.total_points,
          sufficient: currentPoints >= redeemData.total_points,
          rewardDetails: redeemData.rewards.map(r => ({
            reward_id: r.reward_id,
            quantity: r.quantity,
            points_cost: r.points_cost,
            total: r.quantity * r.points_cost
          })),
          calculatedTotal: redeemData.rewards.reduce((sum, r) => sum + (r.quantity * r.points_cost), 0)
        });

        if (currentPoints < redeemData.total_points) {
          throw new BadRequestException('Puntos insuficientes para completar el canje');
        }

        // 2. Validate each reward and check stock
        const rewardChecks = await Promise.all(
          redeemData.rewards.map(async (item) => {
            const reward = await prisma.rewards.findUnique({
              where: { id: item.reward_id },
            });

            if (!reward) {
              throw new NotFoundException(`Recompensa con ID ${item.reward_id} no encontrada`);
            }

            if (reward.stock !== null && reward.stock < item.quantity) {
              throw new BadRequestException(`Stock insuficiente para la recompensa: ${reward.name}`);
            }

            if (reward.points_cost !== item.points_cost) {
              throw new BadRequestException(`El costo de puntos no coincide para la recompensa: ${reward.name}`);
            }

            return { reward, requestedQuantity: item.quantity };
          })
        );

        // 3. Create the main redemption record
        const redemption = await prisma.reward_redemptions.create({
          data: {
            user_id: userId,
            status: 'PENDING',
            total_points: redeemData.total_points,
          },
        });

        // 4. Create redemption lines and update stock
        const lines = await Promise.all(
          redeemData.rewards.map(async (item, index) => {
            const { reward } = rewardChecks[index];

            // Create redemption line
            const line = await prisma.reward_redemption_lines.create({
              data: {
                redemption_id: redemption.id,
                reward_id: item.reward_id,
                quantity: item.quantity,
                points_cost: item.points_cost,
              },
            });

            // Update stock if it's tracked
            if (reward.stock !== null) {
              await prisma.rewards.update({
                where: { id: item.reward_id },
                data: {
                  stock: {
                    decrement: item.quantity,
                  },
                },
              });
            }

            return {
              id: line.id,
              reward_id: reward.id,
              reward_name: reward.name,
              quantity: item.quantity,
              points_cost: item.points_cost,
              total_points: item.points_cost * item.quantity,
            };
          })
        );

        // 5. Create points ledger entry (negative points for redemption)
        await prisma.points_ledger.create({
          data: {
            user_id: userId,
            points: -redeemData.total_points,
            type: 'SPEND',
            reward_id: null, // We could link to the first reward or keep it null for bulk redemptions
          },
        });

        this.logger.log(`Redemption completed successfully for user: ${userId}, redemption ID: ${redemption.id}`);

        const response = {
          id: Number(redemption.id),
          user_id: redemption.user_id,
          status: redemption.status || 'PENDING',
          total_points: redemption.total_points,
          created_at: redemption.created_at || new Date(),
          lines,
        };

        // Serialize BigInt values for JSON response
        return JSON.parse(
          JSON.stringify(response, (key, value) =>
            typeof value === 'bigint' ? Number(value) : value,
          ),
        ) as RedemptionResponseDto;
      });
    } catch (error) {
      this.logger.error(`Error processing redemption for user ${userId}:`, error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al procesar el canje');
    }
  }

  async getUserRedemptions(userId: string): Promise<RedemptionResponseDto[]> {
    try {
      const redemptions = await this.prisma.reward_redemptions.findMany({
        where: { user_id: userId },
        include: {
          reward_redemption_lines: {
            include: {
              rewards: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      const transformedRedemptions = redemptions.map(redemption => ({
        id: Number(redemption.id),
        user_id: redemption.user_id,
        status: redemption.status || 'PENDING',
        total_points: redemption.total_points,
        created_at: redemption.created_at || new Date(),
        lines: redemption.reward_redemption_lines.map(line => ({
          id: Number(line.id),
          reward_id: line.reward_id,
          reward_name: line.rewards.name,
          quantity: line.quantity,
          points_cost: line.points_cost,
          total_points: line.points_cost * line.quantity,
        })),
      }));

      // Serialize BigInt values for JSON response
      return JSON.parse(
        JSON.stringify(transformedRedemptions, (key, value) =>
          typeof value === 'bigint' ? Number(value) : value,
        ),
      ) as RedemptionResponseDto[];
    } catch (error) {
      this.logger.error(`Error getting redemptions for user ${userId}:`, error);
      throw new BadRequestException('Error al obtener los canjes del usuario');
    }
  }
}
