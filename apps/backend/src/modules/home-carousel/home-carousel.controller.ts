import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Request as NestRequest,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { HomeCarouselService } from './home-carousel.service';
import { CreateHomeCarouselSlideDto } from './dto/create-home-carousel-slide.dto';
import { UpdateHomeCarouselSlideDto } from './dto/update-home-carousel-slide.dto';
import { HomeCarouselSlideResponseDto } from './dto/home-carousel-slide-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Home Carousel')
@Controller('home-carousel')
export class HomeCarouselController {
  constructor(private readonly homeCarouselService: HomeCarouselService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener slides activos del carrusel (público)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de slides activos.',
    type: [HomeCarouselSlideResponseDto],
  })
  async findAllPublic(): Promise<HomeCarouselSlideResponseDto[]> {
    return this.homeCarouselService.findAllPublic();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener todos los slides (admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los slides.',
    type: [HomeCarouselSlideResponseDto],
  })
  async findAllAdmin(): Promise<HomeCarouselSlideResponseDto[]> {
    return this.homeCarouselService.findAllAdmin();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener un slide por ID (admin)' })
  @ApiParam({ name: 'id', type: Number })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HomeCarouselSlideResponseDto> {
    return this.homeCarouselService.findOne(id);
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear slide (admin)' })
  @ApiBody({ type: CreateHomeCarouselSlideDto })
  @ApiResponse({ status: 201, type: HomeCarouselSlideResponseDto })
  async create(
    @Body() dto: CreateHomeCarouselSlideDto,
  ): Promise<HomeCarouselSlideResponseDto> {
    return this.homeCarouselService.create(dto);
  }

  @Put('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar slide (admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateHomeCarouselSlideDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHomeCarouselSlideDto,
  ): Promise<HomeCarouselSlideResponseDto> {
    return this.homeCarouselService.update(id, dto);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar slide (admin)' })
  @ApiParam({ name: 'id', type: Number })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.homeCarouselService.remove(id);
  }

  @Post('upload-image')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Subir imagen para slide (admin)',
  })
  @ApiResponse({
    status: 201,
    description: 'Imagen subida. URL en response.',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        path: { type: 'string' },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo.');
    }
    return this.homeCarouselService.uploadImage(file);
  }
}
