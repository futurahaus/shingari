import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

enum OrderStates {
  pending = 'pending',
  accepted = 'accepted',
  delivered = 'delivered',
  cancelled = 'cancelled'
}

export class UpdateOrderDto {
  @ApiProperty({ 
    description: 'Estado de la orden', 
    enum: OrderStates,
    example: 'accepted',
    required: false
  })
  @IsOptional()
  @IsEnum(OrderStates)
  status?: OrderStates;

  @ApiProperty({ 
    description: 'Monto total de la orden',
    required: false
  })
  @IsOptional()
  @IsNumber()
  total_amount?: number;

  @ApiProperty({ 
    description: 'Moneda',
    example: 'EUR',
    required: false
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ 
    description: 'Puntos utilizados en la orden',
    required: false,
    default: 0
  })
  @IsOptional()
  @IsNumber()
  used_points?: number;

  @ApiProperty({ 
    description: 'Puntos ganados en la orden',
    required: false,
    default: 0
  })
  @IsOptional()
  @IsNumber()
  earned_points?: number;
}
