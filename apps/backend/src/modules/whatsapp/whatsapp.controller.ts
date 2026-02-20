import {
  Controller,
  Get,
  Put,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { WhatsAppService } from './whatsapp.service';

@ApiTags('WhatsApp')
@Controller('whatsapp')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Get('status')
  @ApiOperation({ summary: 'Obtener estado de conexión de la instancia WhatsApp' })
  @ApiResponse({
    status: 200,
    description: 'Estado de conexión obtenido correctamente.',
    schema: {
      type: 'object',
      properties: {
        instanceName: { type: 'string' },
        state: { type: 'string' },
        connected: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Evolution API no configurado o error.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido - requiere rol admin.' })
  async getStatus() {
    return this.whatsappService.getConnectionState();
  }

  @Get('qrcode')
  @ApiOperation({ summary: 'Obtener código QR para conectar WhatsApp' })
  @ApiResponse({
    status: 200,
    description: 'Código QR generado correctamente.',
    schema: {
      type: 'object',
      properties: {
        base64: { type: 'string', nullable: true },
        pairingCode: { type: 'string', nullable: true },
        code: { type: 'string', nullable: true },
        count: { type: 'number', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Evolution API no configurado o error.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido - requiere rol admin.' })
  async getQrCode() {
    return this.whatsappService.getQrCode();
  }

  @Put('restart')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reiniciar la instancia de WhatsApp' })
  @ApiResponse({
    status: 200,
    description: 'Instancia reiniciada correctamente.',
    schema: {
      type: 'object',
      properties: {
        instanceName: { type: 'string' },
        state: { type: 'string' },
        connected: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Evolution API no configurado o error.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido - requiere rol admin.' })
  async restart() {
    return this.whatsappService.restart();
  }

  @Delete('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desconectar la instancia de WhatsApp' })
  @ApiResponse({
    status: 200,
    description: 'Instancia desconectada correctamente.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Evolution API no configurado o error.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Prohibido - requiere rol admin.' })
  async logout() {
    return this.whatsappService.logout();
  }
}
