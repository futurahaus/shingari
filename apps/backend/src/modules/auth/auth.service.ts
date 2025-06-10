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
}
