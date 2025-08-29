import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PointsService } from './points.service';

@ApiTags('Points')
@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user points summary' })
  @ApiResponse({
    status: 200,
    description: 'User points summary retrieved successfully.',
  })
  async getMyPoints(@Request() req) {
    const userId = req.user.id;
    return this.pointsService.getPointsSummary(userId);
  }

  @Get('me/balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user points balance' })
  @ApiResponse({
    status: 200,
    description: 'User points balance retrieved successfully.',
  })
  async getMyPointsBalance(@Request() req) {
    const userId = req.user.id;
    return this.pointsService.getUserPointsBalance(userId);
  }

  @Get('me/ledger')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user points ledger' })
  @ApiResponse({
    status: 200,
    description: 'User points ledger retrieved successfully.',
  })
  async getMyPointsLedger(@Request() req) {
    const userId = req.user.id;
    return this.pointsService.getUserPointsLedger(userId);
  }
}
