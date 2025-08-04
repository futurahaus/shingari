import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddFavoriteDto {
  @ApiProperty({
    description: 'ID of the product to add to favorites',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  productId: number;
}