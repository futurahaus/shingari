import { Controller, Put, Get, Body, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('profile')
  async updateProfile(
    @Request() req,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.userService.updateUserProfile(req.user.id, updateUserProfileDto);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    return this.userService.getUserProfile(req.user.id);
  }
} 