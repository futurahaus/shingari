import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsUUID, IsNotEmpty, Min, IsPositive, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

enum OrderStates {
  pending = 'pending',
  accepted = 'accepted',
  delivered = 'delivered',
  cancelled = 'cancelled'
}

export class CreateOrderLineDto {
  @ApiProperty({ description: 'ID del producto' })
  @IsNumber()
  @IsPositive()
  product_id: number;

  @ApiProperty({ description: 'Nombre del producto' })
  @IsString()
  @IsNotEmpty()
  product_name: string;

  @ApiProperty({ description: 'Cantidad del producto' })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ description: 'Precio unitario' })
  @IsNumber()
  @IsPositive()
  unit_price: number;
}

export class CreateOrderAddressDto {
  @ApiProperty({ description: 'Tipo de dirección (billing/shipping)' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Nombre completo' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({ description: 'Línea de dirección 1' })
  @IsString()
  @IsNotEmpty()
  address_line1: string;

  @ApiProperty({ description: 'Línea de dirección 2', required: false })
  @IsOptional()
  @IsString()
  address_line2?: string;

  @ApiProperty({ description: 'Ciudad' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Estado/Provincia', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ description: 'Código postal' })
  @IsString()
  @IsNotEmpty()
  postal_code: string;

  @ApiProperty({ description: 'País' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'Teléfono', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateOrderPaymentDto {
  @ApiProperty({ description: 'Método de pago' })
  @IsString()
  @IsNotEmpty()
  payment_method: string;

  @ApiProperty({ description: 'Monto del pago' })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'ID de transacción', required: false })
  @IsOptional()
  @IsString()
  transaction_id?: string;

  @ApiProperty({ description: 'Metadatos adicionales', required: false })
  @IsOptional()
  metadata?: any;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'ID del usuario', required: false })
  @IsOptional()
  @IsUUID(undefined, { message: 'user_id debe ser un UUID válido' })
  user_id?: string;

  @ApiProperty({ 
    description: 'Estado de la orden', 
    default: 'pending',
    enum: OrderStates,
    example: 'pending'
  })
  @IsOptional()
  @IsEnum(OrderStates)
  status?: OrderStates;

  @ApiProperty({ description: 'Monto total de la orden' })
  @IsNumber()
  @IsPositive()
  total_amount: number;

  @ApiProperty({ description: 'Moneda', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Puntos ganados por la orden', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  points_earned?: number;

  @ApiProperty({ description: 'Líneas de la orden', type: [CreateOrderLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderLineDto)
  order_lines: CreateOrderLineDto[];

  @ApiProperty({ description: 'Direcciones de la orden', type: [CreateOrderAddressDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderAddressDto)
  order_addresses: CreateOrderAddressDto[];

  @ApiProperty({ description: 'Pagos de la orden', type: [CreateOrderPaymentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderPaymentDto)
  order_payments: CreateOrderPaymentDto[];
} 