import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { Prisma } from '../../../generated/prisma';
import { OrdersService } from '../orders/orders.service';
import { FavoritesService } from '../favorites/favorites.service';

interface PublicUser {
  first_name?: string;
  last_name?: string;
  trade_name?: string;
  city?: string;
  province?: string;
  country?: string;
  phone?: string;
  profile_is_complete?: boolean;
  tax_name?: string;
  tax_id?: string;
  billing_address?: string;
  shipping_address?: string;
  postal_code?: string;
  internal_id?: string;
}

interface AdminUser {
  id: string;
  email: string;
  created_at: Date;
  updated_at: Date;
  email_confirmed_at: Date | null;
  last_sign_in_at: Date | null;
  raw_user_meta_data: any;
  user_roles: { roles: { name: string } }[];
  users: Partial<PublicUser>[];
}

export interface UserDetailsResponse {
  id: string;
  email: string;
  created_at: Date;
  updated_at: Date;
  email_confirmed_at: Date | null;
  last_sign_in_at: Date | null;
  roles: string[];
  meta_data: any;
  first_name: string;
  last_name: string;
  trade_name: string;
  city: string;
  province: string;
  country: string;
  phone: string;
  profile_is_complete: boolean;
  tax_name?: string;
  tax_id?: string;
  billing_address?: string;
  shipping_address?: string;
  postal_code?: string;
  internal_id?: string;
  total_billed: number;
  public_profile: Partial<PublicUser>;
}

@Injectable()
export class UserService {
  constructor(
    private readonly supabaseService: DatabaseService,
    private readonly prismaService: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly favoritesService: FavoritesService,
  ) {}

  async updateUserProfile(
    userId: string,
    updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('users')
      .upsert({
        ...updateUserProfileDto,
        uuid: userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException('User profile not found');
    }

    return data;
  }

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('users')
      .select('*')
      .eq('uuid', userId)
      .single();

    if (error) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException('User profile not found');
    }

    return data;
  }

  // Admin methods for user management
  async getAllUsers() {
    try {
      const users = await this.prismaService.auth_users.findMany({
        take: 100,
        select: {
          id: true,
          email: true,
          created_at: true,
          updated_at: true,
          email_confirmed_at: true,
          last_sign_in_at: true,
          raw_user_meta_data: true,
          user_roles: {
            include: {
              roles: true,
            },
          },
          users: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return users.map((user) => {
        const publicProfile = user.users as Partial<PublicUser>;
        return {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          updated_at: user.updated_at,
          email_confirmed_at: user.email_confirmed_at,
          last_sign_in_at: user.last_sign_in_at,
          roles: user.user_roles.map((ur) => ur.roles.name),
          meta_data: user.raw_user_meta_data,
          first_name: publicProfile?.first_name ?? '',
          last_name: publicProfile?.last_name ?? '',
          trade_name: publicProfile?.trade_name ?? '',
          internal_id: publicProfile?.internal_id ?? '',
          city: publicProfile?.city ?? '',
          province: publicProfile?.province ?? '',
          country: publicProfile?.country ?? '',
          tax_name: publicProfile?.tax_name ?? '',
          phone: publicProfile?.phone ?? '',
          profile_is_complete: publicProfile?.profile_is_complete ?? false,
        };
      });

      const result = users.map((user) => {
        const publicProfile = user.users as Partial<PublicUser>;
        return {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          updated_at: user.updated_at,
          email_confirmed_at: user.email_confirmed_at,
          last_sign_in_at: user.last_sign_in_at,
          roles: user.user_roles.map((ur) => ur.roles.name),
          meta_data: user.raw_user_meta_data,
          first_name: publicProfile?.first_name ?? '',
          last_name: publicProfile?.last_name ?? '',
          trade_name: publicProfile?.trade_name ?? '',
          internal_id: publicProfile?.internal_id ?? '',
          city: publicProfile?.city ?? '',
          province: publicProfile?.province ?? '',
          country: publicProfile?.country ?? '',
          tax_name: publicProfile?.tax_name ?? '',
          phone: publicProfile?.phone ?? '',
          profile_is_complete: publicProfile?.profile_is_complete ?? false,
        };
      });

      // Serialize BigInt values for JSON response
      return JSON.parse(
        JSON.stringify(result, (key, value) =>
          typeof value === 'bigint' ? Number(value) : value,
        ),
      );
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  async getUserById(userId: string): Promise<UserDetailsResponse> {
    try {
      const user = (await this.prismaService.auth_users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          created_at: true,
          updated_at: true,
          email_confirmed_at: true,
          last_sign_in_at: true,
          raw_user_meta_data: true,
          user_roles: {
            include: {
              roles: true,
            },
          },
          users: true,
        },
      })) as AdminUser | null;

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const publicProfile: Partial<PublicUser> =
        user.users as Partial<PublicUser>;

      // Obtener el total facturado por el usuario
      const totalBilled =
        await this.ordersService.getTotalBilledByUserId(userId);

      return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
        email_confirmed_at: user.email_confirmed_at,
        last_sign_in_at: user.last_sign_in_at,
        roles: Array.isArray(user.user_roles)
          ? user.user_roles.map((ur) => ur.roles.name)
          : [],
        meta_data: user.raw_user_meta_data,
        first_name: publicProfile?.first_name ?? '',
        last_name: publicProfile?.last_name ?? '',
        trade_name: publicProfile?.trade_name ?? '',
        city: publicProfile?.city ?? '',
        province: publicProfile?.province ?? '',
        country: publicProfile?.country ?? '',
        phone: publicProfile?.phone ?? '',
        profile_is_complete: publicProfile?.profile_is_complete ?? false,
        tax_name: publicProfile?.tax_name ?? '',
        tax_id: publicProfile?.tax_id ?? '',
        billing_address: publicProfile?.billing_address ?? '',
        shipping_address: publicProfile?.shipping_address ?? '',
        postal_code: publicProfile?.postal_code ?? '',
        internal_id: publicProfile?.internal_id ?? '',
        total_billed: totalBilled,
        public_profile: publicProfile,
      };
    } catch (err: unknown) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      if (err instanceof Error) {
        throw new Error(`Failed to fetch user: ${err.message}`);
      }
      throw new Error('Failed to fetch user: Unknown error');
    }
  }

  async createUser(userData: {
    email: string;
    password: string;
    roles?: string[];
  }): Promise<UserDetailsResponse> {
    try {
      // First, create the user in Supabase auth
      const { data: authData, error: authError } = await this.supabaseService
        .getAdminClient()
        .auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
        });

      if (authError) {
        throw new Error(`Failed to create user: ${authError.message}`);
      }

      // If roles are specified, assign them
      if (userData.roles && userData.roles.length > 0) {
        await this.assignRolesToUser(authData.user.id, userData.roles);
      }

      return this.getUserById(authData.user.id);
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async updateUser(
    userId: string,
    userData: { email?: string; roles?: string[]; [key: string]: any },
  ): Promise<UserDetailsResponse> {
    try {
      // Update user in Supabase auth if email is provided
      if (userData.email) {
        const { error: authError } = await this.supabaseService
          .getAdminClient()
          .auth.admin.updateUserById(userId, {
            email: userData.email,
          });

        if (authError) {
          throw new Error(`Failed to update user: ${authError.message}`);
        }
      }

      // Update roles if provided
      if (userData.roles) {
        // First, remove all existing roles
        await this.prismaService.user_roles.deleteMany({
          where: { user_id: userId },
        });

        // Then assign new roles
        await this.assignRolesToUser(userId, userData.roles);
      }

      // Update public.users fields if present
      const publicFields = [
        'first_name',
        'last_name',
        'trade_name',
        'city',
        'province',
        'country',
        'phone',
        'profile_is_complete',
        'postal_code',
        'gender',
        'birth_date',
        'accepted_terms',
        'tax_id',
        'billing_address',
        'shipping_address',
        'referral_source',
        'nombrefiscal',
        'tax_name',
        'internal_id',
      ];

      const publicData: Record<string, any> = {};

      for (const key of publicFields) {
        if (key in userData) {
          publicData[key] = userData[key];
        }
      }

      if (Object.keys(publicData).length > 0) {
        // Find the public_users record by uuid
        const publicUser = await this.prismaService.public_users.findFirst({
          where: { uuid: userId },
        });
        await this.prismaService.public_users.upsert({
          where: { id: publicUser?.id ?? 0 },
          create: { uuid: userId, ...publicData },
          update: publicData,
        });
      }

      return this.getUserById(userId);
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async deleteUser(userId: string) {
    try {
      // Delete user from Supabase auth
      const { error: authError } = await this.supabaseService
        .getAdminClient()
        .auth.admin.deleteUser(userId);

      if (authError) {
        throw new Error(`Failed to delete user: ${authError.message}`);
      }

      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async assignRolesToUser(userId: string, roleNames: string[]) {
    try {
      for (const roleName of roleNames) {
        // Get or create role
        let role = await this.prismaService.roles.findUnique({
          where: { name: roleName },
        });

        if (!role) {
          role = await this.prismaService.roles.create({
            data: {
              name: roleName,
              description: `Role for ${roleName}`,
            },
          });
        }

        // Assign role to user (Prisma will handle duplicates)
        await this.prismaService.user_roles.upsert({
          where: {
            user_id_role_id: {
              user_id: userId,
              role_id: role.id,
            },
          },
          update: {},
          create: {
            user_id: userId,
            role_id: role.id,
          },
        });
      }
    } catch (error) {
      throw new Error(`Failed to assign roles: ${error.message}`);
    }
  }

  // Get order history for a user
  async getUserOrders(userId: string) {
    try {
      const orders = await this.prismaService.orders.findMany({
        where: {
          user_id: userId,
        },
        take: 100,
        include: {
          order_lines: {
            include: {
              products: {
                select: {
                  name: true,
                  image_url: true,
                },
              },
            },
          },
          order_payments: true,
          order_addresses: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      // Serialize BigInt values for JSON response
      const serializedOrders = JSON.parse(
        JSON.stringify(orders, (key, value) =>
          typeof value === 'bigint' ? Number(value) : value,
        ),
      ) as typeof orders;

      return serializedOrders;
    } catch (error) {
      throw new Error(`Failed to fetch user orders: ${error.message}`);
    }
  }

  // Get special prices for a user
  async getUserSpecialPrices(userId: string) {
    const discounts = await this.prismaService.products_discounts.findMany({
      where: {
        user_id: userId,
        is_active: true,
      },
      take: 100,
      include: {
        products: {
          select: {
            name: true,
            list_price: true,
            wholesale_price: true,
            sku: true,
          },
        },
      },
    });
    return discounts.map((d) => ({
      id: d.id.toString(),
      product: d.products?.name || '',
      sku: d.products?.sku || '',
      priceRetail: d.products?.list_price?.toString() || '',
      priceWholesale: d.products?.wholesale_price?.toString() || '',
      priceClient: d.price?.toString() || '',
      productId: d.product_id?.toString() || '',
      isActive: d.is_active,
      validFrom: d.valid_from?.toISOString() || '',
      validTo: d.valid_to?.toISOString() || '',
    }));

    const result = discounts.map((d) => ({
      id: d.id.toString(),
      product: d.products?.name || '',
      priceRetail: d.products?.list_price?.toString() || '',
      priceWholesale: d.products?.wholesale_price?.toString() || '',
      priceClient: d.price?.toString() || '',
      productId: d.product_id?.toString() || '',
      isActive: d.is_active,
      validFrom: d.valid_from?.toISOString() || '',
      validTo: d.valid_to?.toISOString() || '',
    }));

    // Serialize BigInt values for JSON response
    return JSON.parse(
      JSON.stringify(result, (key, value) =>
        typeof value === 'bigint' ? Number(value) : value,
      ),
    );
  }

  // Create a special price for a user
  async createSpecialPrice(createSpecialPriceData: {
    user_id: string;
    product_id: number;
    price: number;
    is_active?: boolean;
    valid_from?: string;
    valid_to?: string;
  }) {
    const {
      user_id,
      product_id,
      price,
      is_active = true,
      valid_from,
      valid_to,
    } = createSpecialPriceData;

    // Verify that the product exists
    const product = await this.prismaService.products.findUnique({
      where: { id: product_id },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Verify that the user exists
    const user = await this.prismaService.auth_users.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if a special price already exists for this user and product
    const existingDiscount =
      await this.prismaService.products_discounts.findFirst({
        where: {
          user_id: user_id,
          product_id: product_id,
          is_active: true,
        },
      });

    if (existingDiscount) {
      throw new Error(
        'A special price already exists for this user and product',
      );
    }

    // Use transaction to ensure atomicity: create special price AND add to favorites
    const specialPrice = await this.prismaService.$transaction(async (tx) => {
      const createdSpecialPrice = await tx.products_discounts.create({
        data: {
          user_id,
          product_id,
          price: new Prisma.Decimal(price),
          is_active,
          valid_from: valid_from ? new Date(valid_from) : null,
          valid_to: valid_to ? new Date(valid_to) : null,
        },
        include: {
          products: {
            select: { name: true, list_price: true, wholesale_price: true },
          },
        },
      });

      // Auto-add product to favorites (upsert to handle race conditions)
      await tx.favorites.upsert({
        where: {
          user_id_product_id: { user_id, product_id },
        },
        create: { user_id, product_id },
        update: {}, // No update needed if already exists
      });

      return createdSpecialPrice;
    });

    return {
      id: specialPrice.id,
      product: specialPrice.products?.name || '',
      priceRetail: specialPrice.products?.list_price?.toString() || '',
      priceWholesale: specialPrice.products?.wholesale_price?.toString() || '',
      priceClient: specialPrice.price?.toString() || '',
      isActive: specialPrice.is_active,
      validFrom: specialPrice.valid_from,
      validTo: specialPrice.valid_to,
    };
  }

  // Update a special price for a user
  async updateSpecialPrice(
    specialPriceId: string,
    updateSpecialPriceData: {
      user_id: string;
      product_id: number;
      price: number;
      is_active?: boolean;
      valid_from?: string;
      valid_to?: string;
    },
  ) {
    const {
      user_id,
      product_id,
      price,
      is_active = true,
      valid_from,
      valid_to,
    } = updateSpecialPriceData;

    // Verify that the special price exists
    const existingSpecialPrice =
      await this.prismaService.products_discounts.findUnique({
        where: { id: parseInt(specialPriceId) },
      });

    if (!existingSpecialPrice) {
      throw new Error('Special price not found');
    }

    // Verify that the product exists
    const product = await this.prismaService.products.findUnique({
      where: { id: product_id },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Verify that the user exists
    const user = await this.prismaService.auth_users.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if another special price already exists for this user and product (excluding current one)
    const existingDiscount =
      await this.prismaService.products_discounts.findFirst({
        where: {
          user_id: user_id,
          product_id: product_id,
          is_active: true,
          id: { not: parseInt(specialPriceId) },
        },
      });

    if (existingDiscount) {
      throw new Error(
        'A special price already exists for this user and product',
      );
    }

    // Update the special price and ensure product is in favorites
    const updatedSpecialPrice = await this.prismaService.$transaction(
      async (tx) => {
        const updated = await tx.products_discounts.update({
          where: { id: parseInt(specialPriceId) },
          data: {
            user_id,
            product_id,
            price: new Prisma.Decimal(price),
            is_active,
            valid_from: valid_from ? new Date(valid_from) : null,
            valid_to: valid_to ? new Date(valid_to) : null,
          },
          include: {
            products: {
              select: { name: true, list_price: true, wholesale_price: true },
            },
          },
        });

        // Ensure product is in favorites (handles legacy special prices)
        await tx.favorites.upsert({
          where: {
            user_id_product_id: { user_id, product_id },
          },
          create: { user_id, product_id },
          update: {},
        });

        return updated;
      },
    );

    return {
      id: updatedSpecialPrice.id,
      product: updatedSpecialPrice.products?.name || '',
      priceRetail: updatedSpecialPrice.products?.list_price?.toString() || '',
      priceWholesale:
        updatedSpecialPrice.products?.wholesale_price?.toString() || '',
      priceClient: updatedSpecialPrice.price?.toString() || '',
      isActive: updatedSpecialPrice.is_active,
      validFrom: updatedSpecialPrice.valid_from,
      validTo: updatedSpecialPrice.valid_to,
    };
  }

  // Delete a special price for a user
  async deleteSpecialPrice(userId: string, specialPriceId: string) {
    // Verify that the special price exists and belongs to the user
    const existingSpecialPrice =
      await this.prismaService.products_discounts.findFirst({
        where: {
          id: parseInt(specialPriceId),
          user_id: userId,
        },
      });

    if (!existingSpecialPrice) {
      throw new Error('Special price not found');
    }

    const productId = existingSpecialPrice.product_id;

    // Use transaction to ensure atomicity: delete special price AND remove from favorites
    await this.prismaService.$transaction(async (tx) => {
      // Delete the special price
      await tx.products_discounts.delete({
        where: { id: parseInt(specialPriceId) },
      });

      // Auto-remove product from favorites if productId exists
      if (productId) {
        await tx.favorites.deleteMany({
          where: {
            user_id: userId,
            product_id: productId,
          },
        });
      }
    });

    return { success: true, message: 'Special price deleted successfully' };
  }

  /**
   * Adds a product to user's favorites if it's not already there.
   * Uses upsert to handle race conditions safely.
   * This is used when a special price is assigned to ensure the product
   * appears in the user's favorites list automatically.
   */
  private async addProductToFavoritesIfNotExists(
    userId: string,
    productId: number,
  ): Promise<void> {
    try {
      const isAlreadyFavorite = await this.favoritesService.isFavorite(
        userId,
        productId,
      );

      if (!isAlreadyFavorite) {
        await this.favoritesService.addFavorite(userId, productId);
      }
    } catch (error) {
      // Ignore ConflictException (race condition: already added by another process)
      if (error instanceof ConflictException) {
        return;
      }
      throw error;
    }
  }
}
