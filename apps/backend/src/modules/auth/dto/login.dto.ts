import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User email address for login',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'P@$$wOrd123',
        description: 'User password for login',
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    password: string;
} 