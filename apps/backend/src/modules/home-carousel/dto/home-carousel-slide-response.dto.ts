import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HomeCarouselSlideResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  image_url: string;

  @ApiPropertyOptional()
  link_url?: string;

  @ApiPropertyOptional()
  title?: string;

  @ApiProperty()
  sort_order: number;

  @ApiProperty()
  is_active: boolean;

  @ApiPropertyOptional()
  created_at?: Date;

  @ApiPropertyOptional()
  updated_at?: Date;
}
