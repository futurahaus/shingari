import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsArray,
  IsEnum,
  IsIn,
} from 'class-validator';

export enum ProductSortByPrice {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum ProductSortByName {
  A_TO_Z = 'A_TO_Z',
  Z_TO_A = 'Z_TO_A',
}

export enum ProductSortField {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  SKU = 'sku',
  NAME = 'name',
  LIST_PRICE = 'list_price',
  WHOLESALE_PRICE = 'wholesale_price',
  IVA = 'iva',
  UNITS_PER_BOX = 'units_per_box',
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryProductDto {
  @ApiPropertyOptional({
    description: 'Número de página',
    default: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de productos por página',
    default: 10,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Término de búsqueda general (SKU, nombre, ID)',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Término de búsqueda por nombre de producto',
  })
  @IsOptional()
  @IsString()
  searchName?: string;

  @ApiPropertyOptional({
    description:
      'Nombres de categorías para filtrar. Para múltiples categorías, envíe el parámetro repetido (ej: categoryFilters=Cat1&categoryFilters=Cat2). Swagger UI debería manejar esto automáticamente.',
    type: [String],
    name: 'categoryFilters',
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

  @ApiPropertyOptional({
    description: 'ID de categoría específica para filtrar productos',
    type: String,
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Estado del producto para filtrar',
    enum: ['active', 'draft', 'paused', 'deleted'],
    example: 'active',
  })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'draft', 'paused', 'deleted'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Ordenar por precio',
    enum: ProductSortByPrice,
  })
  @IsOptional()
  @IsEnum(ProductSortByPrice)
  sortByPrice?: ProductSortByPrice;

  @ApiPropertyOptional({
    description: 'Ordenar por nombre (A-Z o Z-A)',
    enum: ProductSortByName,
  })
  @IsOptional()
  @IsEnum(ProductSortByName)
  sortByName?: ProductSortByName;

  @ApiPropertyOptional({
    description: 'Campo por el que ordenar',
    enum: ProductSortField,
  })
  @IsOptional()
  @IsEnum(ProductSortField)
  sortField?: ProductSortField;

  @ApiPropertyOptional({
    description: 'Dirección de orden',
    enum: SortDirection,
  })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection;

  @ApiPropertyOptional({
    description: 'Locale for translations (es, zh)',
    example: 'es',
    default: 'es',
  })
  @IsOptional()
  @IsString()
  @IsIn(['es', 'zh'])
  locale?: string = 'es';
}
