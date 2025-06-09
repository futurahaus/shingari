import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestPasswordResetDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address to send password reset instructions',
  })
  @IsEmail()
  email: string;
}

export class ConfirmPasswordResetDto {
  @ApiProperty({
    example: 'newPassword123',
    description: 'New password to set',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}