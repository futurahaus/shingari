import { ApiProperty } from '@nestjs/swagger';

// Tipo estricto para estados de producto
export type ProductStatusType = 'active' | 'paused';

export class ToggleStatusResponseDto {
  @ApiProperty({
    description: 'ID del producto',
    example: '123',
  })
  id: string;

  @ApiProperty({
    description: 'Nuevo estado del producto',
    example: 'active',
    enum: ['active', 'paused'],
  })
  status: ProductStatusType;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-11-29T10:30:00.000Z',
  })
  updatedAt: Date;
}
