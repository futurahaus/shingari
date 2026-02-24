import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class UpdateOrderLineDto {
  @ApiProperty({ description: 'Cantidad del producto' })
  @IsNumber()
  @IsPositive()
  quantity: number;
}
