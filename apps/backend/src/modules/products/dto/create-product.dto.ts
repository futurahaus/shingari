import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsArray, ValidateNested, ArrayMinSize, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

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
  @ApiProperty({ description: 'Nombre del producto', example: 'Laptop Gamer XYZ' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Descripción detallada del producto', example: 'Una laptop potente para gaming y trabajo.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Precio del producto', example: 1299.99, type: Number })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Stock inicial del producto', example: 50, type: Number })
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
  @ArrayMinSize(0) // Puede no tener categorías inicialmente o ser opcional
  @IsOptional()
  categoryIds?: string[]; // Asumiendo que las categorías se identifican por un string (ID o slug)

  // Si tuvieras metadatos o atributos customizables podrías usar algo como:
  // @ApiPropertyOptional({ type: [ProductMetadataDto], description: 'Metadatos adicionales del producto' })
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => ProductMetadataDto)
  // @IsOptional()
  // metadata?: ProductMetadataDto[];
} 