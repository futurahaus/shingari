import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum RedemptionSortField {
  ID = 'id',
  USER_ID = 'user_id',
  STATUS = 'status',
  TOTAL_POINTS = 'total_points',
  CREATED_AT = 'created_at',
}

export enum RedemptionSortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export enum RedemptionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class QueryRedemptionDto {
  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Número de elementos por página',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Término de búsqueda para filtrar por ID de usuario',
    example: 'uuid-here',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    enum: RedemptionSortField,
    example: RedemptionSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(RedemptionSortField)
  sortField?: RedemptionSortField = RedemptionSortField.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    enum: RedemptionSortDirection,
    example: RedemptionSortDirection.DESC,
  })
  @IsOptional()
  @IsEnum(RedemptionSortDirection)
  sortDirection?: RedemptionSortDirection = RedemptionSortDirection.DESC;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del canje',
    enum: RedemptionStatus,
    example: RedemptionStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(RedemptionStatus)
  status?: RedemptionStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por puntos mínimos utilizados',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPoints?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por puntos máximos utilizados',
    example: 1000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPoints?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por fecha de creación desde (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por fecha de creación hasta (ISO 8601)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
