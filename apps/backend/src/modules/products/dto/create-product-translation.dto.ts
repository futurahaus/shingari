import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class CreateProductTranslationDto {
  @ApiProperty({
    description: 'Locale for the translation',
    example: 'zh',
    enum: ['es', 'zh'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['es', 'zh'])
  locale: string;

  @ApiProperty({
    description: 'Translated name of the product',
    example: 'Product Name in Chinese',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Translated description of the product',
    example: 'Product description in Chinese',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
} 