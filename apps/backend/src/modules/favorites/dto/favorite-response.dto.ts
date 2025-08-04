import { ApiProperty } from '@nestjs/swagger';

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
    description: 'Product image URL',
    example: 'https://example.com/coffee.jpg',
    required: false,
  })
  image_url?: string;

  @ApiProperty({
    description: 'Product list price',
    example: '25.99',
  })
  list_price: string;

  @ApiProperty({
    description: 'Product wholesale price',
    example: '18.99',
  })
  wholesale_price: string;

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