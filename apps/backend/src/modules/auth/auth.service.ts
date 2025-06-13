import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { DatabaseLogger } from '../database/database.logger';
import { RegisterDto } from './dto/register.dto';
import {
  RequestPasswordResetDto,
  ConfirmPasswordResetDto,
} from './dto/reset-password.dto';
import { AssignRoleDto, UserRole as UserRoleEnum } from './dto/assign-role.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';

interface UserRole {
  roles: {
    name: string;
  };
}

interface AuthUser {
  id: string;
  email: string;
  role: string;
  roles?: string[];
  app_metadata?: {
    provider?: string;
    roles?: string[];
  };
}

interface SupabaseAuthResponse {
  data: {
    user: AuthUser | null;
  };
  error: Error | null;
}

interface SupabaseRolesResponse {
  data: UserRole[] | null;
  error: Error | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly databaseService: DatabaseService,
    private readonly logger: DatabaseLogger,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const { data, error } = await this.databaseService
        .getClient()
        .auth.signUp({
          email: registerDto.email,
          password: registerDto.password,
          options: {
            emailRedirectTo: `${process.env.FRONTEND_URL}/auth/verify-email`,
          },
        });

      this.logger.logInfo(
        'Supabase signUp response: ' + JSON.stringify({ data, error }),
      );

      // If error is present, handle as before
      if (error) {
        const msg = error.message?.toLowerCase() || '';
        if (
          msg.includes('already registered') ||
          msg.includes('already exists') ||
          msg.includes('duplicate') ||
          msg.includes('user with this email') ||
          msg.includes('email is already')
        ) {
          throw new ConflictException('Email already registered');
        }
        throw new ConflictException(
          'Registration failed. Please try again later.',
        );
      }

      return {
        message:
          'Registration successful. Please check your email to confirm your account.',
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
      };
    } catch (error) {
      this.logger.logError('User Registration', error);
      throw error;
    }
  }

  private async authenticateAndGetRoles(
    email: string,
    password: string,
  ): Promise<{ user: AuthUser | null; roles: string[] }> {
    // Step 1: Authenticate user
    const {
      data: { user },
      error: authError,
    } = (await this.databaseService
      .getClient()
      .auth.signInWithPassword({ email, password })) as SupabaseAuthResponse;

    if (authError) {
      if (authError.message.includes('Email not confirmed')) {
        throw new UnauthorizedException(
          'Please confirm your email before logging in',
        );
      }
      this.logger.logError('User Authentication', authError);
      return { user: null, roles: [] };
    }

    if (!user) {
      return { user: null, roles: [] };
    }

    // Step 2: Fetch user roles in parallel with authentication
    const { data: userRoles, error: rolesError } = (await this.databaseService
      .getAdminClient()
      .from('user_roles')
      .select('roles:role_id(name)')
      .eq('user_id', user.id)) as { data: UserRole[] | null; error: any };

    if (rolesError) {
      this.logger.logError('User Roles Fetch', rolesError);
      throw rolesError;
    }

    const customRoles = (userRoles || []).map((ur) => ur.roles.name);
    const roles = ['authenticated', ...customRoles];

    return { user, roles };
  }

  private async updateUserWithRoles(
    user: AuthUser,
    roles: string[],
  ): Promise<AuthUser> {
    const { error: updateError } = await this.databaseService
      .getAdminClient()
      .auth.admin.updateUserById(user.id, {
        app_metadata: {
          provider: user.app_metadata?.provider || 'email',
          roles,
        },
      });

    if (updateError) {
      this.logger.logError('User Metadata Update', updateError);
      throw updateError;
    }

    return {
      ...user,
      role: roles[0],
      roles,
      app_metadata: {
        ...user.app_metadata,
        provider: user.app_metadata?.provider || 'email',
        roles,
      },
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthUser | null> {
    try {
      // Step 1: Authenticate and get roles in parallel
      const { user, roles } = await this.authenticateAndGetRoles(
        email,
        password,
      );
      if (!user) return null;

      // Step 2: Update user with roles
      return this.updateUserWithRoles(user, roles);
    } catch (error) {
      this.logger.logError('User Validation', error);
      throw error;
    }
  }

  async generateTokens(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      provider: user.app_metadata?.provider || 'email',
      role: user.role || 'authenticated', // Include the root-level role
      roles: user.app_metadata?.roles || ['authenticated'], // Include the roles array with default
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const {
        data: { user },
        error,
      } = await this.databaseService.getClient().auth.getUser();

      if (error || !user || user.id !== payload.sub) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      this.logger.logError('Token Refresh', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async signOut() {
    try {
      const { error } = await this.databaseService.getClient().auth.signOut();

      if (error) {
        this.logger.logError('Sign Out', error);
        throw error;
      }

      this.logger.logInfo('User signed out successfully');
    } catch (error) {
      this.logger.logError('Sign Out', error);
      throw error;
    }
  }

  async verifyEmail(token: string) {
    this.logger.logInfo('Attempting to verify email');

    try {
      const {
        data: { user },
        error,
      } = await this.databaseService.getClient().auth.getUser(token);

      if (error) {
        this.logger.logError('Email verification', error);
        throw error;
      }

      this.logger.logInfo('Email verified successfully');
      return { message: 'Email verified successfully', user };
    } catch (error) {
      this.logger.logError('Email verification', error);
      throw error;
    }
  }

  async verifySupabaseToken(token: string) {
    try {
      // Use Supabase client to verify the token
      const {
        data: { user },
        error,
      } = await this.databaseService.getClient().auth.getUser(token);

      if (error) {
        this.logger.logError('Supabase token verification', error);
        return { data: { user: null }, error };
      }

      if (!user) {
        return { data: { user: null }, error: new Error('No user found') };
      }

      // Get user roles
      const { data: userRoles, error: rolesError } = (await this.databaseService
        .getAdminClient()
        .from('user_roles')
        .select('roles:role_id(name)')
        .eq('user_id', user.id)) as { data: UserRole[] | null; error: any };

      if (rolesError) {
        this.logger.logError('User roles fetch', rolesError);
        return { data: { user: null }, error: rolesError };
      }

      const customRoles = (userRoles || []).map((ur) => ur.roles.name);
      const roles = ['authenticated', ...customRoles];

      // Update user with roles
      const updatedUser = {
        ...user,
        role: roles[0],
        roles,
        app_metadata: {
          ...user.app_metadata,
          provider: user.app_metadata?.provider || 'email',
          roles,
        },
      };

      return { data: { user: updatedUser }, error: null };
    } catch (error) {
      this.logger.logError('Supabase token verification', error);
      return { data: { user: null }, error };
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const { error } = await this.databaseService
        .getClient()
        .auth.resetPasswordForEmail(email, {
          redirectTo: `${process.env.FRONTEND_URL}/auth/reset-password`,
        });

      if (error) {
        this.logger.logError('Password Reset Request', error);
        throw new BadRequestException(
          'Error al solicitar el restablecimiento de contraseña',
        );
      }
    } catch (error) {
      this.logger.logError('Password Reset Request', error);
      throw new BadRequestException(
        'Error al solicitar el restablecimiento de contraseña',
      );
    }
  }

  async confirmPasswordReset(
    accessToken: string,
    newPassword: string,
  ): Promise<void> {
    try {
      // First verify the token
      const {
        data: { user },
        error: verifyError,
      } = await this.databaseService.getClient().auth.getUser(accessToken);

      if (verifyError || !user) {
        this.logger.logError('Password Reset Token Verification', verifyError);
        throw new BadRequestException(
          'Token de restablecimiento de contraseña no válido o expirado',
        );
      }

      // Update the user's password using the regular auth API
      const { error: updateError } = await this.databaseService
        .getClient()
        .auth.updateUser({
          password: newPassword,
        });

      if (updateError) {
        this.logger.logError('Password Reset Update', updateError);
        throw new BadRequestException('Error al restablecer la contraseña');
      }
    } catch (error) {
      this.logger.logError('Password Reset Confirmation', error);
      throw new BadRequestException('Error al restablecer la contraseña');
    }
  }

  async assignRole(assignRoleDto: AssignRoleDto): Promise<void> {
    try {
      const { userId, role } = assignRoleDto;

      // First, check if the role exists in the roles table
      const { data: existingRole, error: roleError } = await this.databaseService
        .getAdminClient()
        .from('roles')
        .select('id')
        .eq('name', role)
        .single();

      if (roleError || !existingRole) {
        // Role doesn't exist, create it
        const { data: newRole, error: createRoleError } = await this.databaseService
          .getAdminClient()
          .from('roles')
          .insert({ name: role, description: `${role} role` })
          .select('id')
          .single();

        if (createRoleError) {
          this.logger.logError('Role Creation', createRoleError);
          throw new BadRequestException('Failed to create role');
        }

        // Assign the new role to the user
        const { error: assignError } = await this.databaseService
          .getAdminClient()
          .from('user_roles')
          .insert({
            user_id: userId,
            role_id: newRole.id,
          });

        if (assignError) {
          this.logger.logError('Role Assignment', assignError);
          throw new BadRequestException('Failed to assign role to user');
        }
      } else {
        // Role exists, assign it to the user
        const { error: assignError } = await this.databaseService
          .getAdminClient()
          .from('user_roles')
          .insert({
            user_id: userId,
            role_id: existingRole.id,
          });

        if (assignError) {
          // Check if it's a duplicate key error (user already has this role)
          if (assignError.code === '23505') {
            this.logger.logInfo(`User ${userId} already has role ${role}`);
            return; // User already has this role, which is fine
          }

          this.logger.logError('Role Assignment', assignError);
          throw new BadRequestException('Failed to assign role to user');
        }
      }

      // Update user's app_metadata with the new role
      const { error: updateError } = await this.databaseService
        .getAdminClient()
        .auth.admin.updateUserById(userId, {
          app_metadata: {
            roles: [role],
          },
        });

      if (updateError) {
        this.logger.logError('User Metadata Update', updateError);
        throw new BadRequestException('Failed to update user metadata');
      }

      this.logger.logInfo(`Role ${role} assigned successfully to user ${userId}`);
    } catch (error) {
      this.logger.logError('Role Assignment', error);
      throw error;
    }
  }

  async updateProfile(userId: string, completeProfileDto: CompleteProfileDto) {
    try {
      // Map the frontend form fields to the database schema fields
      const profileData = {
        uuid: userId,
        first_name: completeProfileDto.nombre,
        last_name: completeProfileDto.apellidos,
        city: completeProfileDto.localidad,
        province: completeProfileDto.provincia,
        country: completeProfileDto.pais,
        postal_code: completeProfileDto.cp,
        phone: completeProfileDto.telefono,
        profile_is_complete: true,
        trade_name: completeProfileDto.trade_name,
        // TODO: Uncomment when database schema is properly synced
        // nombreFiscal: completeProfileDto.nombreFiscal,
        tax_id: completeProfileDto.tax_id,
        billing_address: completeProfileDto.billing_address,
        shipping_address: completeProfileDto.shipping_address,
        referral_source: completeProfileDto.referral_source,
      };

      // Update the public.users table with all the data
      const { data: userProfile, error: profileError } = await this.databaseService
        .getAdminClient()
        .from('users')
        .upsert(profileData)
        .select()
        .single();

      if (profileError) {
        this.logger.logError('Profile Update', profileError);
        throw new BadRequestException('Failed to update user profile');
      }

      this.logger.logInfo(`Profile updated successfully for user ${userId}`);
      return userProfile;
    } catch (error) {
      this.logger.logError('Profile Update', error);
      throw error;
    }
  }

  async getCompleteUserProfile(userId: string) {
    try {
      // Get user profile data from public.users table
      const { data: userProfile, error: profileError } = await this.databaseService
        .getAdminClient()
        .from('users')
        .select('*')
        .eq('uuid', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is fine for new users
        this.logger.logError('Profile Fetch', profileError);
        throw new BadRequestException('Failed to fetch user profile');
      }

      // Get user email from auth.users table
      const { data: { user }, error: userError } = await this.databaseService
        .getAdminClient()
        .auth.admin.getUserById(userId);

      if (userError || !user) {
        this.logger.logError('User Fetch', userError);
        throw new BadRequestException('Failed to fetch user data');
      }

      console.log(userProfile);
      const completeProfile = {
        id: userId,
        email: user.email || '',
        // Map public.users data to frontend field names
        nombre: userProfile?.first_name || null,
        apellidos: userProfile?.last_name || null,
        localidad: userProfile?.city || null,
        provincia: userProfile?.province || null,
        pais: userProfile?.country || null,
        cp: userProfile?.postal_code || null,
        telefono: userProfile?.phone || null,
        profile_is_complete: userProfile?.profile_is_complete || false,
        // Get business-specific data from the new database fields
        trade_name: userProfile?.trade_name || null,
        // TODO: Uncomment when database schema is properly synced
        // nombreFiscal: userProfile?.nombreFiscal || null,
        tax_id: userProfile?.tax_id || null,
        billing_address: userProfile?.billing_address || null,
        shipping_address: userProfile?.shipping_address || null,
        referral_source: userProfile?.referral_source || null,
      };

      return completeProfile;
    } catch (error) {
      this.logger.logError('Complete Profile Fetch', error);
      throw error;
    }
  }
}
