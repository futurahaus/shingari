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
  Headers,
  Put,
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
  ApiHeader,
} from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';
import { SimpleMessageResponseDto } from './dto/simple-message-response.dto';
import { MeResponseDto } from './dto/me-response.dto';
import { Logger } from '@nestjs/common';
import {
  RequestPasswordResetDto,
  ConfirmPasswordResetDto,
} from './dto/reset-password.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';

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
  async getProfile(@NestRequest() req): Promise<MeResponseDto> {
    return this.authService.getCompleteUserProfile(req.user.id);
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

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ type: RequestPasswordResetDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset email sent successfully.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña.',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al solicitar el restablecimiento de contraseña',
  })
  async requestPasswordReset(
    @Body() { email }: RequestPasswordResetDto,
  ): Promise<{ message: string }> {
    await this.authService.requestPasswordReset(email);
    return {
      message: 'Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña.',
    };
  }

  @Post('reset-password/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm password reset' })
  @ApiBody({ type: ConfirmPasswordResetDto })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token received in the password reset email link',
    required: true,
    schema: {
      type: 'string',
      example: 'Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6ImNHanA3c0x4ano5RTVDdVQiLCJ0eXAiOiJKV1QifQ...',
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset successful.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Contraseña restablecida exitosamente.',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al restablecer la contraseña',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de restablecimiento de contraseña no válido o expirado',
  })
  async confirmPasswordReset(
    @Headers('authorization') authHeader: string,
    @Body() { password }: ConfirmPasswordResetDto,
  ): Promise<{ message: string }> {
    const accessToken = authHeader?.replace('Bearer ', '');
    if (!accessToken) {
      throw new UnauthorizedException('Token de restablecimiento de contraseña no válido o expirado');
    }
    await this.authService.confirmPasswordReset(accessToken, password);
    return {
      message: 'Contraseña restablecida exitosamente.',
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @ApiOperation({ summary: 'Update current authenticated user profile' })
  @ApiBody({ type: CompleteProfileDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile updated successfully.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  async updateProfile(
    @NestRequest() req,
    @Body() completeProfileDto: CompleteProfileDto,
  ) {
    return this.authService.updateProfile(req.user.id, completeProfileDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('assign-role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiBody({ type: AssignRoleDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role assigned successfully.',
    type: SimpleMessageResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid role or user.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  async assignRole(
    @Body() assignRoleDto: AssignRoleDto,
  ): Promise<SimpleMessageResponseDto> {
    await this.authService.assignRole(assignRoleDto);
    return { message: 'Role assigned successfully' };
  }
}
