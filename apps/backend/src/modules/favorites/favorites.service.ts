import {
  Injectable,
  NotFoundException,
  ConflictException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async addFavorite(userId: string, productId: number) {
    // Check if product exists
    const product = await this.prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Check if already favorited
    const existingFavorite = await this.prisma.favorites.findUnique({
      where: {
        user_id_product_id: { user_id: userId, product_id: productId },
      },
    });

    if (existingFavorite) {
      throw new ConflictException('Product is already in favorites');
    }

    const favorite = await this.prisma.favorites.create({
      data: {
        user_id: userId,
        product_id: productId,
      },
      include: {
        products: true,
      },
    });

    // Transform the response to match the DTO structure
    return {
      user_id: favorite.user_id,
      product_id: favorite.product_id,
      created_at: favorite.created_at,
      product: {
        id: favorite.products.id,
        name: favorite.products.name,
        description: favorite.products.description || '',
        image_url: favorite.products.image_url || '',
        list_price: favorite.products.list_price.toString(),
        wholesale_price: favorite.products.wholesale_price.toString(),
        sku: favorite.products.sku,
        status: favorite.products.status || 'active',
      },
    };
  }

  async removeFavorite(userId: string, productId: number) {
    // Check if favorite exists
    const favorite = await this.prisma.favorites.findUnique({
      where: {
        user_id_product_id: { user_id: userId, product_id: productId },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    return this.prisma.favorites.delete({
      where: {
        user_id_product_id: { user_id: userId, product_id: productId },
      },
    });
  }

  async getFavorites(userId: string) {
    const favorites = await this.prisma.favorites.findMany({
      where: { user_id: userId },
      include: { products: true },
      orderBy: { created_at: 'desc' },
    });

    // Transform the response to match the DTO structure
    const transformedFavorites = favorites.map(favorite => ({
      user_id: favorite.user_id,
      product_id: favorite.product_id,
      created_at: favorite.created_at,
      product: {
        id: favorite.products.id,
        name: favorite.products.name,
        description: favorite.products.description || '',
        image_url: favorite.products.image_url || '',
        list_price: favorite.products.list_price.toString(),
        wholesale_price: favorite.products.wholesale_price.toString(),
        sku: favorite.products.sku,
        status: favorite.products.status || 'active',
      },
    }));

    return {
      favorites: transformedFavorites,
      total: favorites.length,
    };
  }

  async isFavorite(userId: string, productId: number): Promise<boolean> {
    const favorite = await this.prisma.favorites.findUnique({
      where: {
        user_id_product_id: { user_id: userId, product_id: productId },
      },
    });

    return !!favorite;
  }
}