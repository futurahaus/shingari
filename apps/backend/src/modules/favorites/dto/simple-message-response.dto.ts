import { ApiProperty } from '@nestjs/swagger';

export class SimpleMessageResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Product added to favorites successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;
} 