import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, UnauthorizedException, Get, Request as NestRequest } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';
import { SimpleMessageResponseDto } from './dto/simple-message-response.dto';
import { MeResponseDto } from './dto/me-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'User successfully registered.', type: SimpleMessageResponseDto })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already registered.' })
    async register(@Body() registerDto: RegisterDto): Promise<SimpleMessageResponseDto> {
        const result = await this.authService.register(registerDto);
        return { message: result.message };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User login' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successful login.', type: LoginResponseDto })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Usuario o contraseña incorrectos' })
    async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Usuario o contraseña incorrectos');
        }
        return this.authService.generateTokens(user);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiBody({ type: RefreshTokenDto })
    @ApiResponse({ status: HttpStatus.OK, description: 'Tokens refreshed successfully.', type: LoginResponseDto })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid refresh token.' })
    async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<LoginResponseDto> {
        return this.authService.refreshTokens(refreshTokenDto.refreshToken);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiOperation({ summary: 'Get current authenticated user profile' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Current user data.', type: MeResponseDto })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
    getProfile(@NestRequest() req): MeResponseDto {
        return req.user;
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User logout' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully logged out', type: SimpleMessageResponseDto })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
    async logout(): Promise<SimpleMessageResponseDto> {
        await this.authService.signOut();
        return { message: 'Successfully logged out' };
    }
}

