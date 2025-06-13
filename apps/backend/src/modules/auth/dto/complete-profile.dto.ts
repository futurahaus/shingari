import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteProfileDto {
  @ApiProperty({
    example: 'Juan',
    description: 'User first name',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  nombre: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'User last name',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  apellidos: string;

  @ApiProperty({
    example: 'Madrid',
    description: 'City of residence',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  localidad: string;

  @ApiProperty({
    example: 'Madrid',
    description: 'Province or state of residence',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  provincia: string;

  @ApiProperty({
    example: 'Mi Empresa S.L.',
    description: 'Commercial name',
    minLength: 1,
    maxLength: 150,
  })
  @IsString()
  @Length(1, 150)
  trade_name: string;

  @ApiProperty({
    example: 'España',
    description: 'Country of residence',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  pais: string;

  @ApiProperty({
    example: 'Mi Empresa Fiscal S.L.',
    description: 'Fiscal name',
    minLength: 1,
    maxLength: 150,
  })
  @IsString()
  @Length(1, 150)
  nombreFiscal: string;

  @ApiProperty({
    example: '+34612345678',
    description: 'Phone number',
    minLength: 1,
    maxLength: 20,
  })
  @IsString()
  @Length(1, 20)
  telefono: string;

  @ApiProperty({
    example: 'B12345678',
    description: 'Tax identification number',
    minLength: 1,
    maxLength: 20,
  })
  @IsString()
  @Length(1, 20)
  tax_id: string;

  @ApiProperty({
    example: 'Calle Mayor 123, Madrid',
    description: 'Fiscal address',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @Length(1, 200)
  billing_address: string;

  @ApiProperty({
    example: 'Calle Comercial 456, Madrid',
    description: 'Delivery address',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @Length(1, 200)
  shipping_address: string;

  @ApiProperty({
    example: '28001',
    description: 'Postal code',
    minLength: 1,
    maxLength: 10,
  })
  @IsString()
  @Length(1, 10)
  cp: string;

  @ApiProperty({
    example: 'redes',
    description: 'How the user found out about the service',
    enum: ['redes', 'recomendacion', 'publicidad', 'otros'],
  })
  @IsString()
  referral_source: string;
}