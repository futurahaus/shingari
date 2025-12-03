import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

// Interface for product with images from Prisma query
interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  sort_order: number | null;
  is_main: boolean | null;
  created_at: Date | null;
}

interface ProductWithImages {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  list_price: Decimal;
  wholesale_price: Decimal;
  iva: Decimal | null;
  sku: string;
  status: string | null;
  product_images: ProductImage[];
}

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user role for price calculations
   */
  private async getUserRole(userId: string): Promise<string | null> {
    const user = await this.prisma.auth_users.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return user?.role || null;
  }

  /**
   * Get user-specific discount for a product
   */
  private async getUserDiscount(
    userId: string,
    productId: number,
  ): Promise<number | null> {
    const now = new Date();
    const discount = await this.prisma.products_discounts.findFirst({
      where: {
        user_id: userId,
        product_id: productId,
        is_active: true,
        AND: [
          { OR: [{ valid_from: { lte: now } }, { valid_from: null }] },
          { OR: [{ valid_to: { gte: now } }, { valid_to: null }] },
        ],
      },
      select: { price: true },
    });
    return discount?.price?.toNumber() || null;
  }

  /**
   * Calculate product price with IVA and discounts
   */
  private calculateProductPrice(
    product: {
      list_price: { toNumber: () => number };
      wholesale_price: { toNumber: () => number };
      iva: { toNumber: () => number } | null;
    },
    userRole: string | null,
    userDiscountPrice: number | null,
  ): { price: number; originalPrice?: number; discount: number } {
    const listPrice = product.list_price.toNumber();
    const wholesalePrice = product.wholesale_price.toNumber();

    // Business users see wholesale price, others see list price
    const basePrice = userRole === 'business' ? wholesalePrice : listPrice;

    // If user has a special discount price
    if (userDiscountPrice !== null) {
      const discountPercent = Math.round(
        ((basePrice - userDiscountPrice) / basePrice) * 100,
      );
      return {
        price: userDiscountPrice,
        originalPrice: basePrice,
        discount: discountPercent > 0 ? discountPercent : 0,
      };
    }

    return { price: basePrice, discount: 0 };
  }

  /**
   * Normalize IVA value to percentage
   */
  private normalizeIva(ivaValue: number | null | undefined): number {
    if (!ivaValue) return 21; // Default 21%
    // If stored as decimal (0.21), convert to percentage
    if (ivaValue < 1 && ivaValue > 0) {
      return ivaValue * 100;
    }
    return ivaValue;
  }

  /**
   * Transform product with calculated prices
   */
  private async transformProductForFavorite(
    product: ProductWithImages,
    userId: string,
  ) {
    const userRole = await this.getUserRole(userId);
    const userDiscountPrice = await this.getUserDiscount(userId, product.id);

    const { price, originalPrice, discount } = this.calculateProductPrice(
      {
        list_price: { toNumber: () => product.list_price.toNumber() },
        wholesale_price: { toNumber: () => product.wholesale_price.toNumber() },
        iva: product.iva ? { toNumber: () => product.iva!.toNumber() } : null,
      },
      userRole,
      userDiscountPrice,
    );

    // Calculate IVA-included prices for non-business users
    let finalPrice = price;
    let finalOriginalPrice = originalPrice;

    if (userRole !== 'business') {
      const ivaPercent = this.normalizeIva(product.iva?.toNumber());
      finalPrice = price * (1 + ivaPercent / 100);
      if (originalPrice) {
        finalOriginalPrice = originalPrice * (1 + ivaPercent / 100);
      }
    }

    // Get images from product_images relation
    const images: string[] = product.product_images.map((img) => img.image_url);

    return {
      id: product.id,
      name: product.name,
      description: product.description || '',
      images: images,
      price: Math.round(finalPrice * 100) / 100,
      originalPrice: finalOriginalPrice
        ? Math.round(finalOriginalPrice * 100) / 100
        : undefined,
      discount: discount,
      sku: product.sku || '',
      status: product.status || 'active',
      iva: this.normalizeIva(product.iva?.toNumber()),
    };
  }

  async addFavorite(userId: string, productId: number) {
    // Check if product exists
    const product = await this.prisma.products.findUnique({
      where: { id: productId },
      include: {
        product_images: {
          orderBy: { sort_order: 'asc' },
        },
      },
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
    });

    // Transform product with calculated prices
    const transformedProduct = await this.transformProductForFavorite(
      product,
      userId,
    );

    return {
      user_id: favorite.user_id,
      product_id: favorite.product_id,
      created_at: favorite.created_at,
      product: transformedProduct,
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
      include: {
        products: {
          include: {
            product_images: {
              orderBy: { sort_order: 'asc' },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Transform the response with calculated prices
    const transformedFavorites = await Promise.all(
      favorites.map(async (favorite) => {
        const transformedProduct = await this.transformProductForFavorite(
          favorite.products,
          userId,
        );
        return {
          user_id: favorite.user_id,
          product_id: favorite.product_id,
          created_at: favorite.created_at,
          product: transformedProduct,
        };
      }),
    );

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
