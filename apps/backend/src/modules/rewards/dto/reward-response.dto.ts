import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RewardResponseDto {
  @ApiProperty({
    description: 'ID único de la recompensa',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre de la recompensa',
    example: 'Cupón de Descuento 20%',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la recompensa',
    example: 'Cupón válido para cualquier producto con 20% de descuento',
  })
  description: string | null;

  @ApiPropertyOptional({
    description: 'URL de la imagen de la recompensa',
    example: 'https://example.com/images/reward.jpg',
  })
  image_url: string | null;

  @ApiProperty({
    description: 'Costo en puntos para canjear la recompensa',
    example: 100,
  })
  points_cost: number;

  @ApiPropertyOptional({
    description: 'Stock disponible de la recompensa',
    example: 50,
    default: 0,
  })
  stock: number | null;

  @ApiProperty({
    description: 'Fecha de creación de la recompensa',
    example: '2025-01-17T10:30:00Z',
  })
  created_at: Date | null;

  @ApiPropertyOptional({
    description: 'Fecha de última actualización de la recompensa',
    example: '2025-01-17T15:45:00Z',
  })
  updated_at: Date | null;
}

export class PaginatedRewardsResponseDto {
  @ApiProperty({
    description: 'Lista de recompensas',
    type: [RewardResponseDto],
  })
  rewards: RewardResponseDto[];

  @ApiProperty({
    description: 'Número total de recompensas',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Número de página actual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Número de elementos por página',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Número total de páginas',
    example: 3,
  })
  lastPage: number;
}
