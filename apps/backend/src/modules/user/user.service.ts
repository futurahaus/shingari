import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

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
  public_profile: Partial<PublicUser>;
}

@Injectable()
export class UserService {
  constructor(
    private readonly supabaseService: DatabaseService,
    private readonly prismaService: PrismaService,
  ) { }

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
          city: publicProfile?.city ?? '',
          province: publicProfile?.province ?? '',
          country: publicProfile?.country ?? '',
          phone: publicProfile?.phone ?? '',
          profile_is_complete: publicProfile?.profile_is_complete ?? false,
        };
      });
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  async getUserById(userId: string): Promise<UserDetailsResponse> {
    try {
      const user = await this.prismaService.auth_users.findUnique({
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
      }) as AdminUser | null;

      if (!user) {
        throw new NotFoundException('User not found');
      }

      let publicProfile: Partial<PublicUser> = user.users as Partial<PublicUser>;

      return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
        email_confirmed_at: user.email_confirmed_at,
        last_sign_in_at: user.last_sign_in_at,
        roles: Array.isArray(user.user_roles) ? user.user_roles.map((ur) => ur.roles.name) : [],
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
    userData: { email?: string; roles?: string[];[key: string]: any },
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

  // Get order history for a user (mock data for now)
  async getUserOrders(userId: string) {
    // TODO: Replace with real order data if available
    return [
      { id: '123456', date: '2024-07-15', total: '$250.00' },
      { id: '123456', date: '2024-07-01', total: '$180.00' },
      { id: '123456', date: '2024-06-15', total: '$320.00' },
      { id: '123456', date: '2024-06-01', total: '$200.00' },
      { id: '123456', date: '2024-05-15', total: '$150.00' },
    ];
  }

  // Get special prices for a user
  async getUserSpecialPrices(userId: string) {
    const discounts = await this.prismaService.products_discounts.findMany({
      where: {
        user_id: userId,
        is_active: true,
      },
      include: {
        products: {
          select: { name: true, list_price: true },
        },
      },
    });
    return discounts.map((d) => ({
      product: d.products?.name || '',
      priceRetail: d.products?.list_price?.toString() || '',
      priceClient: d.price?.toString() || '',
    }));
  }
}
