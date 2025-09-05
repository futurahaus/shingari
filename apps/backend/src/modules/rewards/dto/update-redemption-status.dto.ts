import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum RedemptionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class UpdateRedemptionStatusDto {
  @ApiProperty({
    description: 'Nuevo estado del canje',
    enum: RedemptionStatus,
    example: RedemptionStatus.PROCESSING,
  })
  @IsEnum(RedemptionStatus)
  status: RedemptionStatus;

  @ApiProperty({
    description: 'Comentario opcional sobre el cambio de estado',
    type: String,
    required: false,
    example: 'Canje procesado y enviado',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
