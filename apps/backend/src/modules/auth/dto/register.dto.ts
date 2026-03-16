import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
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

    @ApiProperty({
        example: '+34612345678',
        description: 'User phone number in E.164 format',
    })
    @IsString()
    @IsNotEmpty({ message: 'El teléfono es obligatorio' })
    @Matches(/^\+[1-9]\d{1,14}$/, {
        message: 'Formato de teléfono inválido (E.164)',
    })
    phone: string;
} 