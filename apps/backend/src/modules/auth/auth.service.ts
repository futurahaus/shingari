import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { DatabaseLogger } from '../database/database.logger';
import { RegisterDto } from './dto/register.dto';

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
    ) { }

    async register(registerDto: RegisterDto) {
        try {
            const { data, error } = await this.databaseService
                .getClient()
                .auth.signUp({
                    email: registerDto.email,
                    password: registerDto.password,
                    options: {
                        emailRedirectTo: `${process.env.FRONTEND_URL}`,
                    },
                });

            if (error) {
                if (error.message.includes('already registered')) {
                    throw new ConflictException('Email already registered');
                }
                this.logger.logError('User Registration', error);
                throw error;
            }

            if (!data.user) {
                throw new Error('Failed to create user');
            }

            // Create entry in public.users table using admin client
            const { error: insertError } = await this.databaseService
                .getAdminClient()
                .from('users')
                .insert({
                    uuid: data.user.id,
                });

            if (insertError) {
                this.logger.logError('User Table Creation', insertError);
                throw insertError;
            }

            // TODO: Move to email verification time.
            // Get the consumer role ID
            const { data: roleData, error: roleError } = await this.databaseService
                .getAdminClient()
                .from('roles')
                .select('id')
                .eq('name', 'consumer')
                .single();

            if (roleError) {
                this.logger.logError('Role Fetch', roleError);
                throw roleError;
            }

            if (!roleData) {
                throw new Error('Consumer role not found');
            }

            // Create user role association
            const { error: userRoleError } = await this.databaseService
                .getAdminClient()
                .from('user_roles')
                .insert({
                    user_id: data.user.id,
                    role_id: roleData.id,
                });

            if (userRoleError) {
                this.logger.logError('User Role Creation', userRoleError);
                throw userRoleError;
            }

            return {
                message: 'Registration successful. Please check your email to confirm your account.',
                user: {
                    id: data.user.id,
                    email: data.user.email,
                }
            };
        } catch (error) {
            this.logger.logError('User Registration', error);
            throw error;
        }
    }

    private async authenticateAndGetRoles(email: string, password: string): Promise<{ user: AuthUser | null; roles: string[] }> {
        // Step 1: Authenticate user
        const { data: { user }, error: authError } = await this.databaseService
            .getClient()
            .auth.signInWithPassword({ email, password }) as SupabaseAuthResponse;

        if (authError) {
            if (authError.message.includes('Email not confirmed')) {
                throw new UnauthorizedException('Please confirm your email before logging in');
            }
            this.logger.logError('User Authentication', authError);
            return { user: null, roles: [] };
        }

        if (!user) {
            return { user: null, roles: [] };
        }

        // Step 2: Fetch user roles in parallel with authentication
        const { data: userRoles, error: rolesError } = await this.databaseService
            .getAdminClient()
            .from('user_roles')
            .select('roles:role_id(name)')
            .eq('user_id', user.id) as SupabaseRolesResponse;

        if (rolesError) {
            this.logger.logError('User Roles Fetch', rolesError);
            throw rolesError;
        }

        const customRoles = (userRoles || []).map(ur => ur.roles.name);
        const roles = ['authenticated', ...customRoles];

        return { user, roles };
    }

    private async updateUserWithRoles(user: AuthUser, roles: string[]): Promise<AuthUser> {
        const { error: updateError } = await this.databaseService
            .getAdminClient()
            .auth.admin.updateUserById(user.id, {
                app_metadata: {
                    provider: user.app_metadata?.provider || 'email',
                    roles
                }
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
                roles
            }
        };
    }

    async validateUser(email: string, password: string): Promise<AuthUser | null> {
        try {
            // Step 1: Authenticate and get roles in parallel
            const { user, roles } = await this.authenticateAndGetRoles(email, password);
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
            role: user.role || 'authenticated',  // Include the root-level role
            roles: user.app_metadata?.roles || ['authenticated']  // Include the roles array with default
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

            const { data: { user }, error } = await this.databaseService
                .getClient()
                .auth.getUser();

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
}