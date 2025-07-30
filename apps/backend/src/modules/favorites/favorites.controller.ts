import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { FavoritesListResponseDto, FavoriteResponseDto } from './dto/favorite-response.dto';
import { SimpleMessageResponseDto } from './dto/simple-message-response.dto';

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add product to favorites' })
  @ApiResponse({
    status: 201,
    description: 'Product added to favorites successfully',
    type: FavoriteResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Product is already in favorites',
  })
  async addFavorite(
    @Request() req: any,
    @Body() addFavoriteDto: AddFavoriteDto,
  ): Promise<FavoriteResponseDto> {
    return this.favoritesService.addFavorite(req.user.id, addFavoriteDto.productId);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove product from favorites' })
  @ApiParam({
    name: 'productId',
    description: 'ID of the product to remove from favorites',
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: 'Product removed from favorites successfully',
    type: SimpleMessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Favorite not found',
  })
  async removeFavorite(
    @Request() req: any,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<SimpleMessageResponseDto> {
    await this.favoritesService.removeFavorite(req.user.id, productId);
    return {
      message: 'Product removed from favorites successfully',
      success: true,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get user favorites' })
  @ApiResponse({
    status: 200,
    description: 'List of user favorites',
    type: FavoritesListResponseDto,
  })
  async getFavorites(@Request() req: any): Promise<FavoritesListResponseDto> {
    return this.favoritesService.getFavorites(req.user.id);
  }

  @Get(':productId/check')
  @ApiOperation({ summary: 'Check if product is in favorites' })
  @ApiParam({
    name: 'productId',
    description: 'ID of the product to check',
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: 'Favorite status',
    schema: {
      type: 'object',
      properties: {
        isFavorite: {
          type: 'boolean',
          example: true,
        },
      },
    },
  })
  async checkFavorite(
    @Request() req: any,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<{ isFavorite: boolean }> {
    const isFavorite = await this.favoritesService.isFavorite(req.user.id, productId);
    return { isFavorite };
  }
} 