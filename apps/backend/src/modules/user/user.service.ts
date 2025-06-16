import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly supabaseService: DatabaseService,
    private readonly prismaService: PrismaService,
  ) { }

  async updateUserProfile(userId: string, updateUserProfileDto: UpdateUserProfileDto) {
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
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return users.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
        email_confirmed_at: user.email_confirmed_at,
        last_sign_in_at: user.last_sign_in_at,
        roles: user.user_roles.map(ur => ur.roles.name),
        meta_data: user.raw_user_meta_data,
      }));
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  async getUserById(userId: string) {
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
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
        email_confirmed_at: user.email_confirmed_at,
        last_sign_in_at: user.last_sign_in_at,
        roles: user.user_roles.map(ur => ur.roles.name),
        meta_data: user.raw_user_meta_data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  async createUser(userData: { email: string; password: string; roles?: string[] }) {
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

  async updateUser(userId: string, userData: { email?: string; roles?: string[] }) {
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
}

