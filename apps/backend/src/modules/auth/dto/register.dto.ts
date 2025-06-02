import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User email address for registration',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'P@$$wOrd123',
        description: 'User password, at least 6 characters long',
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    password: string;
} 