import { Controller, Put, Get, Body, UseGuards, Request as NestRequest } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserProfileDto, Gender } from './dto/update-user-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';

@ApiTags('User Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('profile')
  @ApiOperation({ summary: 'Update current authenticated user profile' })
  @ApiBody({ type: UpdateUserProfileDto })
  @ApiResponse({ status: 200, description: 'User profile updated successfully.', type: UserProfileResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User profile not found (should not happen with upsert logic but good to cover).' })
  async updateProfile(
    @NestRequest() req,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<UserProfileResponseDto> {
    return this.userService.updateUserProfile(req.user.id, updateUserProfileDto);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully.', type: UserProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User profile not found.' })
  async getProfile(@NestRequest() req): Promise<UserProfileResponseDto> {
    return this.userService.getUserProfile(req.user.id);
  }
} 