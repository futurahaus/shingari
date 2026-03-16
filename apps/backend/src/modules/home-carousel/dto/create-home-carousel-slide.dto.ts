import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHomeCarouselSlideDto {
  @ApiProperty({ description: 'URL de la imagen del slide' })
  @IsString()
  image_url: string;

  @ApiPropertyOptional({ description: 'URL de enlace al hacer clic' })
  @IsOptional()
  @IsString()
  link_url?: string;

  @ApiPropertyOptional({ description: 'Título del slide' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Orden de visualización (menor = primero)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sort_order?: number;

  @ApiPropertyOptional({ description: 'Si el slide está activo' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
