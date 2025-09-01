import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsPositive, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class RedeemRewardItemDto {
  @ApiProperty({
    description: 'ID de la recompensa a canjear',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  reward_id: number;

  @ApiProperty({
    description: 'Cantidad de la recompensa a canjear',
    example: 2,
  })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: 'Costo en puntos por unidad',
    example: 100,
  })
  @IsNumber()
  @IsPositive()
  points_cost: number;
}

export class RedeemRewardsDto {
  @ApiProperty({
    description: 'Lista de recompensas a canjear',
    type: [RedeemRewardItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RedeemRewardItemDto)
  rewards: RedeemRewardItemDto[];

  @ApiProperty({
    description: 'Total de puntos a usar en el canje',
    example: 200,
  })
  @IsNumber()
  @IsPositive()
  total_points: number;
}
