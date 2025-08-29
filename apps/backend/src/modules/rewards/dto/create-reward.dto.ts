import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsUrl,
  IsInt,
} from 'class-validator';

export class CreateRewardDto {
  @ApiProperty({
    description: 'Nombre de la recompensa',
    example: 'Cupón de Descuento 20%',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la recompensa',
    example: 'Cupón válido para cualquier producto con 20% de descuento',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'URL de la imagen de la recompensa',
    example: 'https://example.com/images/reward.jpg',
  })
  @IsUrl()
  @IsOptional()
  image_url?: string;

  @ApiProperty({
    description: 'Costo en puntos para canjear la recompensa',
    example: 100,
    type: Number,
  })
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsInt()
  @Min(1)
  points_cost: number;

  @ApiPropertyOptional({
    description: 'Stock disponible de la recompensa',
    example: 50,
    type: Number,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;
}
