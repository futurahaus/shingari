import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class AddOrderLineDto {
  @ApiProperty({ description: 'ID del producto' })
  @IsNumber()
  @IsPositive()
  product_id: number;

  @ApiProperty({ description: 'Cantidad del producto' })
  @IsNumber()
  @IsPositive()
  quantity: number;
}
