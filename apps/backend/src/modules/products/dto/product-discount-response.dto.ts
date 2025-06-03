import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductDiscountResponseDto {
  @ApiProperty({ description: 'ID único del descuento', example: 'clxpb3abc0001a8b4c2defgh2' })
  id: string;

  @ApiProperty({ description: 'ID del producto asociado al descuento' })
  productId: string;

  @ApiPropertyOptional({ description: 'Nombre del producto asociado al descuento' })
  productName?: string;

  @ApiProperty({ description: 'ID del usuario al que aplica el descuento' })
  userId: string;

  @ApiProperty({ description: 'Precio original del producto', example: 100.00, type: Number })
  originalPrice: number;

  @ApiProperty({ description: 'Precio con descuento del producto', example: 90.00, type: Number })
  discountedPrice: number;

  @ApiPropertyOptional({ description: 'Fecha de inicio de validez del descuento' })
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Fecha de fin de validez del descuento' })
  endDate?: Date;

  @ApiProperty({ description: 'Indica si el descuento está activo', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Fecha de creación del descuento (placeholder si no existe en DB)' })
  createdAt: Date;
} 