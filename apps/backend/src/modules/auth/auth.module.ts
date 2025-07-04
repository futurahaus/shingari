import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_ACCESS_SECRET || '',
            signOptions: { expiresIn: '15m' },
        }),
        DatabaseModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule { }
