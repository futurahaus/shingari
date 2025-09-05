import { ApiProperty } from '@nestjs/swagger';

export class RedemptionLineResponseDto {
  @ApiProperty({
    description: 'ID de la línea de canje',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'ID de la recompensa',
    example: 1,
  })
  reward_id: number;

  @ApiProperty({
    description: 'Nombre de la recompensa',
    example: 'Cupón de descuento 20%',
  })
  reward_name: string;

  @ApiProperty({
    description: 'Cantidad canjeada',
    example: 2,
  })
  quantity: number;

  @ApiProperty({
    description: 'Puntos utilizados por unidad',
    example: 100,
  })
  points_cost: number;

  @ApiProperty({
    description: 'Total de puntos para este artículo',
    example: 200,
  })
  total_points: number;
}

export class RedemptionResponseDto {
  @ApiProperty({
    description: 'ID del canje',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'ID del usuario',
    example: 'uuid-here',
  })
  user_id: string;

  @ApiProperty({
    description: 'Estado del canje',
    example: 'PENDING',
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'],
  })
  status: string;

  @ApiProperty({
    description: 'Total de puntos utilizados',
    example: 500,
  })
  total_points: number;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-15T10:30:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Artículos del canje',
    type: [RedemptionLineResponseDto],
  })
  lines: RedemptionLineResponseDto[];
}
