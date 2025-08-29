import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryRewardDto {
  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Número de elementos por página',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Término de búsqueda para filtrar por nombre o descripción',
    example: 'cupón descuento',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    example: 'created_at',
    enum: ['created_at', 'updated_at', 'name', 'points_cost'],
    default: 'created_at',
  })
  @IsOptional()
  @IsIn(['created_at', 'updated_at', 'name', 'points_cost'])
  sortField?: string = 'created_at';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDirection?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Filtrar por costo mínimo de puntos',
    example: 50,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPoints?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por costo máximo de puntos',
    example: 200,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPoints?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por disponibilidad de stock',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  inStock?: boolean;
}
