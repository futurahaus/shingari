import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class LocaleDto {
  @ApiProperty({
    description: 'Locale for translations (es, zh)',
    example: 'es',
    required: false,
    default: 'es',
  })
  @IsOptional()
  @IsString()
  @IsIn(['es', 'zh'])
  locale?: string = 'es';
} 