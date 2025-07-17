import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'El ID único de la categoría.',
  })
  id: string;

  @ApiProperty({
    example: 'Electrónica',
    description: 'El nombre de la categoría.',
  })
  name: string;

  @ApiPropertyOptional({
    example: '456e7890-e12b-34d5-a678-426614174111',
    description: 'El ID de la categoría padre (si existe).',
  })
  parentId?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/image.png',
    description: 'URL de la imagen de la categoría (si existe).',
  })
  image?: string;
} 