import { ApiProperty } from '@nestjs/swagger';
import { RedemptionResponseDto } from './redemption-response.dto';

export class PaginatedRedemptionsResponseDto {
  @ApiProperty({
    description: 'Lista de canjes',
    type: [RedemptionResponseDto],
  })
  data: RedemptionResponseDto[];

  @ApiProperty({
    description: 'Información de paginación',
    example: {
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNext: true,
      hasPrev: false,
    },
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
