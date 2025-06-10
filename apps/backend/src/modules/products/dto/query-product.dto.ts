import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString, IsArray, IsEnum } from 'class-validator';

export enum ProductSortByPrice {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryProductDto {
  @ApiPropertyOptional({ description: 'Número de página', default: 1, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Cantidad de productos por página', default: 10, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Término de búsqueda por nombre de producto' })
  @IsOptional()
  @IsString()
  searchName?: string;

  @ApiPropertyOptional({ 
    description: 'Nombres de categorías para filtrar. Para múltiples categorías, envíe el parámetro repetido (ej: categoryFilters=Cat1&categoryFilters=Cat2). Swagger UI debería manejar esto automáticamente.',
    type: [String],
    name: 'categoryFilters'
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value && !Array.isArray(value)) {
      return [value];
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  categoryFilters?: string[];

  @ApiPropertyOptional({ description: 'Ordenar por precio', enum: ProductSortByPrice })
  @IsOptional()
  @IsEnum(ProductSortByPrice)
  sortByPrice?: ProductSortByPrice;
} 