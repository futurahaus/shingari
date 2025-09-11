import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, ValidateIf } from 'class-validator';

enum OrderStates {
  pending = 'pending',
  accepted = 'accepted',
  delivered = 'delivered',
  cancelled = 'cancelled',
}

export class UpdateOrderDto {
  @ApiProperty({
    description: 'Estado de la orden',
    enum: OrderStates,
    example: 'accepted',
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStates)
  status?: OrderStates;

  @ApiProperty({
    description: 'Monto total de la orden',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  total_amount?: number;

  @ApiProperty({
    description: 'Moneda',
    example: 'EUR',
    required: false,
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: 'Puntos ganados en la orden',
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  earned_points?: number;

  @ApiProperty({
    description: 'URL del archivo de factura',
    required: false,
    example: 'https://spozhuqlvmaieeqtaxvq.supabase.co/storage/v1/object/public/shingari/orders/123e4567-e89b-12d3-a456-426614174000/invoice_1703123456789.pdf'
  })
  @IsOptional()
  @IsString()
  invoice_file_url?: string;

  @ApiProperty({
    description: 'Fecha de entrega de la orden',
    required: false,
    example: '2025-01-20T10:30:00.000Z',
    nullable: true
  })
  @IsOptional()
  @ValidateIf((o) => o.delivery_date !== null)
  @IsDateString()
  delivery_date?: string | null;

  @ApiProperty({
    description: 'Razón de cancelación de la orden',
    required: false,
    example: 'Cliente solicitó cancelación por cambio de planes',
    nullable: true
  })
  @IsOptional()
  @IsString()
  cancellation_reason?: string | null;

  @ApiProperty({
    description: 'Fecha de cancelación de la orden',
    required: false,
    example: '2025-01-20T10:30:00.000Z',
    nullable: true
  })
  @IsOptional()
  @ValidateIf((o) => o.cancellation_date !== null)
  @IsDateString()
  cancellation_date?: string | null;
}
