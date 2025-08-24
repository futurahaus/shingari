import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MeResponseDto {
  @ApiProperty({ example: 'user-uuid-123', description: 'User ID' })
  id: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  // Basic user profile data from public.users table
  @ApiPropertyOptional({ example: 'Juan', description: 'User first name' })
  nombre?: string;

  @ApiPropertyOptional({ example: 'Pérez', description: 'User last name' })
  apellidos?: string;

  @ApiPropertyOptional({ example: 'Madrid', description: 'City of residence' })
  localidad?: string;

  @ApiPropertyOptional({
    example: 'Madrid',
    description: 'Province or state of residence',
  })
  provincia?: string;

  @ApiPropertyOptional({
    example: 'España',
    description: 'Country of residence',
  })
  pais?: string;

  @ApiPropertyOptional({ example: '28001', description: 'Postal code' })
  cp?: string;

  @ApiPropertyOptional({ example: '+34612345678', description: 'Phone number' })
  telefono?: string;

  // Business-specific data from user metadata
  @ApiPropertyOptional({
    example: 'Mi Empresa S.L.',
    description: 'Commercial name',
  })
  nombreComercial?: string;

  @ApiPropertyOptional({
    example: 'B12345678',
    description: 'Tax identification number',
  })
  nif?: string;

  @ApiPropertyOptional({
    example: 'Calle Mayor 123, Madrid',
    description: 'Fiscal address',
  })
  direccionFiscal?: string;

  @ApiPropertyOptional({
    example: 'Calle Comercial 456, Madrid',
    description: 'Delivery address',
  })
  direccionEntrega?: string;

  @ApiPropertyOptional({
    example: 'redes',
    description: 'How the user found out about the service',
    enum: ['redes', 'recomendacion', 'publicidad', 'otros'],
  })
  howDidYouKnowUs?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the profile is completed',
  })
  profile_is_completed?: boolean;

  @ApiPropertyOptional({ example: 100, description: 'User points' })
  points?: number;
}
