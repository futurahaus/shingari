import { ApiProperty } from '@nestjs/swagger';

export class SimpleMessageResponseDto {
    @ApiProperty({ example: 'Operation successful.', description: 'A simple message indicating the result of an operation.' })
    message: string;
} 