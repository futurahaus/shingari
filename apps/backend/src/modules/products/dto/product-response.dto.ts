import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ description: 'ID único del producto', example: 'clxpb2xzo0000a8b4c2defgh1' })
  id: string;

  @ApiProperty({ description: 'Nombre del producto', example: 'Laptop Gamer XYZ' })
  name: string;

  @ApiPropertyOptional({ description: 'Descripción detallada del producto', example: 'Una laptop potente para gaming y trabajo.' })
  description?: string;

  @ApiProperty({ description: 'Precio del producto (con descuento, si aplica)', example: 1299.99 })
  price: number;

  @ApiPropertyOptional({ description: 'Precio original del producto sin descuento', example: 1499.99 })
  originalPrice?: number;

  @ApiPropertyOptional({ description: 'Porcentaje de descuento aplicado al producto', example: 10 })
  discount: number;

  @ApiPropertyOptional({ description: 'Stock disponible del producto', example: 50 })
  stock?: number;

  @ApiProperty({ description: 'Fecha de creación del producto' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización del producto' })
  updatedAt: Date;

  @ApiPropertyOptional({ 
    description: 'Categorías a las que pertenece el producto (ej. nombres o slugs)',
    example: ['electronics', 'gaming', 'laptops'],
    type: [String],
  })
  categories?: string[]; // Esto dependerá de cómo se modele en Prisma (relación o array)

  // Considerar añadir otros campos que sean relevantes desde Prisma, como relaciones cargadas.
}

export class PaginatedProductResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  data: ProductResponseDto[];

  @ApiProperty({ description: 'Total de productos que coinciden con la consulta', example: 100 })
  total: number;

  @ApiProperty({ description: 'Número de página actual', example: 1 })
  page: number;

  @ApiProperty({ description: 'Número de la última página', example: 10 })
  lastPage: number;

  @ApiProperty({ description: 'Cantidad de productos por página', example: 10 })
  limit: number;
} 