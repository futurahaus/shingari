import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class CreateCategoryTranslationDto {
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
    description: 'Translated name of the category',
    example: 'Category Name in Chinese',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
} 