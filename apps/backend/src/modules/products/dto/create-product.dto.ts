import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsArray,
  ArrayMinSize,
  IsInt,
} from 'class-validator';

// Ejemplo de un DTO para un item de metadatos, si los productos tuvieran campos flexibles
// class ProductMetadataDto {
//   @ApiProperty()
//   @IsString()
//   @IsNotEmpty()
//   key: string;

//   @ApiProperty()
//   @IsString()
//   @IsNotEmpty()
//   value: string;
// }

export class CreateProductDto {
  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Gamer XYZ',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del producto',
    example: 'Una laptop potente para gaming y trabajo.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Precio del producto',
    example: 1299.99,
    type: Number,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  listPrice: number;

  @ApiPropertyOptional({
    description: 'Stock inicial del producto',
    example: 50,
    type: Number,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({
    description: 'IDs o nombres de las categorías a las que pertenece el producto',
    example: ['electronics', 'gaming', 'laptops'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(0)
  @IsOptional()
  categoryIds?: string[];

  @ApiPropertyOptional({
    description: 'Precio mayorista del producto',
    example: 999.99,
    type: Number,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  wholesalePrice: number;

  @ApiPropertyOptional({
    description: 'Estado del producto',
    example: 'active',
    enum: ['active', 'draft', 'paused', 'deleted'],
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'URLs de imágenes del producto',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({
    description: 'ID de la unidad para el stock',
    example: 1,
    type: Number,
  })
  @IsInt()
  @IsOptional()
  unit_id?: number;

  @ApiPropertyOptional({
    description: 'Unidades por caja',
    example: 12,
    type: Number,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  units_per_box?: number;

  // Si tuvieras metadatos o atributos customizables podrías usar algo como:
  // @ApiPropertyOptional({ type: [ProductMetadataDto], description: 'Metadatos adicionales del producto' })
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => ProductMetadataDto)
  // @IsOptional()
  // metadata?: ProductMetadataDto[];
} 