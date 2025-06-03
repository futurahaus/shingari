import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
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

  @ApiPropertyOptional({ description: 'IDs o nombres de categorías para filtrar (separados por coma si es string, o array)', type: [String] })
  @IsOptional()
  @IsArray()
  // Si las categorías son IDs numéricos, podrías usar @IsNumberString({ each: true }) o transformar y validar.
  // Por ahora, asumimos strings para flexibilidad (pueden ser slugs o nombres).
  @IsString({ each: true }) 
  categoryFilters?: string[];

  @ApiPropertyOptional({ description: 'Ordenar por precio', enum: ProductSortByPrice })
  @IsOptional()
  @IsEnum(ProductSortByPrice)
  sortByPrice?: ProductSortByPrice;
} 