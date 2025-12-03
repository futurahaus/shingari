import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FavoriteProductDto {
  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Product name',
    example: 'Premium Coffee Beans',
  })
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'High-quality arabica coffee beans',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Product images URLs',
    example: ['https://example.com/coffee1.jpg', 'https://example.com/coffee2.jpg'],
    type: [String],
  })
  images: string[];

  @ApiProperty({
    description: 'Product price (with IVA and discounts applied)',
    example: 25.99,
  })
  price: number;

  @ApiPropertyOptional({
    description: 'Original price before discount',
    example: 29.99,
  })
  originalPrice?: number;

  @ApiProperty({
    description: 'Discount percentage applied',
    example: 10,
  })
  discount: number;

  @ApiProperty({
    description: 'Product SKU',
    example: 'COFFEE-001',
  })
  sku: string;

  @ApiProperty({
    description: 'Product status',
    example: 'active',
    enum: ['active', 'draft', 'paused', 'deleted'],
  })
  status: string;

  @ApiPropertyOptional({
    description: 'IVA percentage',
    example: 21,
  })
  iva?: number;
}

export class FavoriteResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  user_id: string;

  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  product_id: number;

  @ApiProperty({
    description: 'Date when the product was added to favorites',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  created_at: Date | null;

  @ApiProperty({
    description: 'Product information',
    type: FavoriteProductDto,
  })
  product: FavoriteProductDto;
}

export class FavoritesListResponseDto {
  @ApiProperty({
    description: 'List of favorite products',
    type: [FavoriteResponseDto],
  })
  favorites: FavoriteResponseDto[];

  @ApiProperty({
    description: 'Total count of favorites',
    example: 5,
  })
  total: number;
} 