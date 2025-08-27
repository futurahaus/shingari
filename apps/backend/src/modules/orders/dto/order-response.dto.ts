import { ApiProperty } from '@nestjs/swagger';

enum OrderStates {
  pending = 'pending',
  accepted = 'accepted',
  delivered = 'delivered',
  cancelled = 'cancelled'
}

export class OrderLineResponseDto {
  @ApiProperty({ description: 'ID de la línea de orden' })
  id: string;

  @ApiProperty({ description: 'ID del producto' })
  product_id: number;

  @ApiProperty({ description: 'Nombre del producto' })
  product_name: string;

  @ApiProperty({ description: 'Cantidad del producto' })
  quantity: number;

  @ApiProperty({ description: 'Precio unitario' })
  unit_price: number;

  @ApiProperty({ description: 'Precio total de la línea' })
  total_price: number;

  @ApiProperty({ description: 'URL de la imagen del producto', required: false })
  product_image?: string;
}

export class OrderAddressResponseDto {
  @ApiProperty({ description: 'ID de la dirección' })
  id: string;

  @ApiProperty({ description: 'Tipo de dirección' })
  type: string;

  @ApiProperty({ description: 'Nombre completo' })
  full_name: string;

  @ApiProperty({ description: 'Línea de dirección 1' })
  address_line1: string;

  @ApiProperty({ description: 'Línea de dirección 2' })
  address_line2?: string;

  @ApiProperty({ description: 'Ciudad' })
  city: string;

  @ApiProperty({ description: 'Estado/Provincia' })
  state?: string;

  @ApiProperty({ description: 'Código postal' })
  postal_code: string;

  @ApiProperty({ description: 'País' })
  country: string;

  @ApiProperty({ description: 'Teléfono' })
  phone?: string;
}

export class OrderPaymentResponseDto {
  @ApiProperty({ description: 'ID del pago' })
  id: string;

  @ApiProperty({ description: 'Método de pago' })
  payment_method: string;

  @ApiProperty({ description: 'Estado del pago' })
  status: string;

  @ApiProperty({ description: 'Fecha de pago' })
  paid_at?: Date;

  @ApiProperty({ description: 'Monto del pago' })
  amount: number;

  @ApiProperty({ description: 'ID de transacción' })
  transaction_id?: string;

  @ApiProperty({ description: 'Metadatos adicionales' })
  metadata?: any;
}

export class OrderResponseDto {
  @ApiProperty({ description: 'ID de la orden' })
  id: string;

  @ApiProperty({ description: 'ID del usuario' })
  user_id?: string;

  @ApiProperty({ description: 'Email del usuario' })
  user_email?: string;

  @ApiProperty({ description: 'Nombre del usuario' })
  user_name?: string;

  @ApiProperty({ description: 'Nombre comercial del usuario' })
  user_trade_name?: string;

  @ApiProperty({ 
    description: 'Estado de la orden',
    enum: OrderStates,
    example: 'pending'
  })
  status: OrderStates;

  @ApiProperty({ description: 'Monto total de la orden' })
  total_amount: number;

  @ApiProperty({ description: 'Moneda' })
  currency: string;

  @ApiProperty({ description: 'Fecha de creación' })
  created_at: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  updated_at: Date;

  @ApiProperty({ description: 'Puntos utilizados en la orden', required: false })
  used_points?: number;

  @ApiProperty({ description: 'Líneas de la orden', type: [OrderLineResponseDto] })
  order_lines: OrderLineResponseDto[];

  @ApiProperty({ description: 'Direcciones de la orden', type: [OrderAddressResponseDto] })
  order_addresses: OrderAddressResponseDto[];

  @ApiProperty({ description: 'Pagos de la orden', type: [OrderPaymentResponseDto] })
  order_payments: OrderPaymentResponseDto[];
} 