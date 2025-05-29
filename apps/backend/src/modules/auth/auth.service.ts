import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { DatabaseLogger } from '../database/database.logger';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly databaseService: DatabaseService,
        private readonly logger: DatabaseLogger,
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
        try {
            const { data: { user }, error } = await this.databaseService
                .getClient()
                .auth.signInWithPassword({
                    email,
                    password,
                });

            if (error) {
                this.logger.logError('User Validation', error);
                return null;
            }

            if (!user) {
                return null;
            }

            // Return user without sensitive data
            const { email_confirmed_at, phone, phone_confirmed_at, ...result } = user;
            return result;
        } catch (error) {
            this.logger.logError('User Validation', error);
            return null;
        }
    }

    async generateTokens(user: any) {
        const payload = {
            email: user.email,
            sub: user.id,
            provider: user.app_metadata?.provider || 'email'
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
            // Verify the refresh token
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });

            // Get current session from Supabase
            const { data: { user }, error } = await this.databaseService
                .getClient()
                .auth.getUser();

            if (error || !user || user.id !== payload.sub) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            // Generate new tokens
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