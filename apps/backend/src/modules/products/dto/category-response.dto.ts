import { ApiProperty } from '@nestjs/swagger';

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
} 