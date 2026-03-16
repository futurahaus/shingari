import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DatabaseService } from '../database/database.service';
import {
  getBufferFromMulterFile,
  cleanupMulterFile,
} from '../../common/multer.util';
import { CreateHomeCarouselSlideDto } from './dto/create-home-carousel-slide.dto';
import { UpdateHomeCarouselSlideDto } from './dto/update-home-carousel-slide.dto';
import { HomeCarouselSlideResponseDto } from './dto/home-carousel-slide-response.dto';

@Injectable()
export class HomeCarouselService {
  private readonly logger = new Logger(HomeCarouselService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly databaseService: DatabaseService,
  ) {}

  async findAllPublic(): Promise<HomeCarouselSlideResponseDto[]> {
    const slides = await this.prisma.home_carousel_slides.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
    });
    return slides.map((s) => this.mapToResponse(s));
  }

  async findAllAdmin(): Promise<HomeCarouselSlideResponseDto[]> {
    const slides = await this.prisma.home_carousel_slides.findMany({
      orderBy: { sort_order: 'asc' },
    });
    return slides.map((s) => this.mapToResponse(s));
  }

  async findOne(id: number): Promise<HomeCarouselSlideResponseDto> {
    const slide = await this.prisma.home_carousel_slides.findUnique({
      where: { id },
    });
    if (!slide) {
      throw new NotFoundException(`Slide con id ${id} no encontrado`);
    }
    return this.mapToResponse(slide);
  }

  async create(
    dto: CreateHomeCarouselSlideDto,
  ): Promise<HomeCarouselSlideResponseDto> {
    const maxOrder = await this.prisma.home_carousel_slides.aggregate({
      _max: { sort_order: true },
    });
    const sortOrder =
      dto.sort_order ?? (maxOrder._max.sort_order ?? -1) + 1;

    const slide = await this.prisma.home_carousel_slides.create({
      data: {
        image_url: dto.image_url,
        link_url: dto.link_url ?? null,
        title: dto.title ?? null,
        sort_order: sortOrder,
        is_active: dto.is_active ?? true,
      },
    });
    return this.mapToResponse(slide);
  }

  async update(
    id: number,
    dto: UpdateHomeCarouselSlideDto,
  ): Promise<HomeCarouselSlideResponseDto> {
    await this.findOne(id);
    const slide = await this.prisma.home_carousel_slides.update({
      where: { id },
      data: {
        ...(dto.image_url !== undefined && { image_url: dto.image_url }),
        ...(dto.link_url !== undefined && { link_url: dto.link_url }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.sort_order !== undefined && { sort_order: dto.sort_order }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
      },
    });
    return this.mapToResponse(slide);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.home_carousel_slides.delete({
      where: { id },
    });
  }

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ url: string; path: string }> {
    try {
      if (!file) {
        throw new BadRequestException('No se proporcionó ningún archivo.');
      }

      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Tipo de archivo no válido. Solo se permiten imágenes JPEG, PNG y WebP.',
        );
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new BadRequestException(
          'El archivo es demasiado grande. El tamaño máximo es 10MB.',
        );
      }

      const timestamp = Date.now();
      const ext = file.originalname.split('.').pop();
      const fileName = `carousel_${timestamp}.${ext}`;
      const filePath = `home-carousel/${fileName}`;

      let buffer: Buffer;
      try {
        buffer = await getBufferFromMulterFile(file);
      } finally {
        await cleanupMulterFile(file);
      }

      const { error } = await this.databaseService
        .getAdminClient()
        .storage.from('shingari')
        .upload(filePath, buffer, {
          contentType: file.mimetype,
          cacheControl: '31536000',
        });

      if (error) {
        this.logger.error('Error uploading image to Supabase:', error);
        throw new BadRequestException('Error al subir la imagen');
      }

      const { data: urlData } = this.databaseService
        .getAdminClient()
        .storage.from('shingari')
        .getPublicUrl(filePath);

      this.logger.log(`Home carousel image uploaded: ${filePath}`);
      return { url: urlData.publicUrl, path: filePath };
    } catch (error) {
      this.logger.error('Error in uploadImage:', error);
      throw error;
    }
  }

  private mapToResponse(slide: {
    id: number;
    image_url: string;
    link_url: string | null;
    title: string | null;
    sort_order: number;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
  }): HomeCarouselSlideResponseDto {
    return {
      id: slide.id,
      image_url: slide.image_url,
      link_url: slide.link_url ?? undefined,
      title: slide.title ?? undefined,
      sort_order: slide.sort_order,
      is_active: slide.is_active,
      created_at: slide.created_at,
      updated_at: slide.updated_at,
    };
  }
}
