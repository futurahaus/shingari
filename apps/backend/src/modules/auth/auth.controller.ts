import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
  Get,
  Request as NestRequest,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';
import { SimpleMessageResponseDto } from './dto/simple-message-response.dto';
import { MeResponseDto } from './dto/me-response.dto';
import { Logger } from '@nestjs/common';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered.',
    type: SimpleMessageResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already registered.',
  })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<SimpleMessageResponseDto> {
    const result = await this.authService.register(registerDto);
    return { message: result.message };
  }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email verified successfully.',
    type: SimpleMessageResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  async verifyEmail(
    @Query('access_token') accessToken?: string,
    @Query('type') type?: string,
    @Query('refresh_token') refreshToken?: string,
    @Query('expires_in') expiresIn?: string,
    @Query('expires_at') expiresAt?: string,
    @Query('token_type') tokenType?: string,
  ): Promise<SimpleMessageResponseDto> {
    this.logger.log('>> Verifying email with token parameters', {
      accessToken: accessToken?.substring(0, 10) + '...',
      type,
      tokenType,
      expiresIn,
      expiresAt,
    });

    if (!accessToken) {
      throw new UnauthorizedException('No access token provided');
    }

    try {
      const result = await this.authService.verifyEmail(accessToken);

      // If verification successful and we have refresh token, store it
      if (refreshToken) {
        // Store the refresh token or handle it as needed
        this.logger.log('Storing refresh token for future use');
      }

      return result;
    } catch (error) {
      this.logger.error('Email verification failed', error);
      if (error.message.includes('Invalid token format')) {
        throw new UnauthorizedException('Invalid verification token');
      }
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successful login.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Usuario o contraseña incorrectos',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
    return this.authService.generateTokens(user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens refreshed successfully.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token.',
  })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<LoginResponseDto> {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Post('exchange-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange Supabase token for backend tokens' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token exchange successful.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid token.',
  })
  async exchangeToken(
    @Body() loginDto: LoginDto & { supabaseToken?: string },
  ): Promise<LoginResponseDto> {
    if (!loginDto.supabaseToken) {
      throw new UnauthorizedException('No Supabase token provided');
    }

    try {
      // Verify the Supabase token and get user data
      const {
        data: { user },
        error,
      } = await this.authService.verifySupabaseToken(loginDto.supabaseToken);

      if (error || !user) {
        throw new UnauthorizedException('Invalid Supabase token');
      }

      // Generate our backend tokens
      return this.authService.generateTokens(user);
    } catch (error) {
      this.logger.error('Token exchange failed', error);
      throw new UnauthorizedException('Token exchange failed');
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current user data.',
    type: MeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  getProfile(@NestRequest() req): MeResponseDto {
    return req.user;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully logged out',
    type: SimpleMessageResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  async logout(): Promise<SimpleMessageResponseDto> {
    await this.authService.signOut();
    return { message: 'Successfully logged out' };
  }
}
