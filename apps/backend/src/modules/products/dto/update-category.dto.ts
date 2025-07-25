import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Nuevo nombre de la categoría',
    example: 'Electrodomésticos',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Nuevo ID de la categoría padre',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Nuevo orden de la categoría',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  order?: number;
}

export class UpdateCategoriesOrderDto {
  @ApiPropertyOptional({
    description: 'Lista de categorías con su nuevo orden',
    example: [
      { id: '1', order: 1 },
      { id: '2', order: 2 },
    ],
    type: [Object],
  })
  @IsOptional()
  categories!: { id: string; order: number }[];
} 