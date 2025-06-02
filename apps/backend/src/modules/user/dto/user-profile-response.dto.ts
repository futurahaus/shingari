import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from './update-user-profile.dto'; // Asumiendo que Gender está en el mismo DTO o necesitas importarlo de donde esté

export class UserProfileResponseDto {
    @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'User unique identifier (UUID)', format: 'uuid' })
    uuid: string;

    @ApiProperty({ example: 'John', description: 'User first name' })
    first_name: string;

    @ApiProperty({ example: 'Doe', description: 'User last name' })
    last_name: string;

    @ApiPropertyOptional({ example: 'New York', description: 'City of residence' })
    city?: string;

    @ApiPropertyOptional({ example: 'NY', description: 'Province or state of residence' })
    province?: string;

    @ApiPropertyOptional({ example: 'USA', description: 'Country of residence' })
    country?: string;

    @ApiPropertyOptional({ example: '10001', description: 'Postal code' })
    postal_code?: string;

    @ApiProperty({ enum: Gender, example: Gender.M, description: 'User gender' })
    gender: Gender;

    @ApiPropertyOptional({ type: String, format: 'date-time', example: '1990-12-31T00:00:00.000Z', description: 'User birth date' })
    birth_date?: Date;

    @ApiPropertyOptional({ example: '+12125551234', description: 'User phone number' })
    phone?: string;

    @ApiProperty({ example: true, description: 'Indicates if user accepted terms and conditions' })
    accepted_terms: boolean;
    
    // Importante: Añade aquí CUALQUIER OTRO CAMPO que tu servicio devuelva para un perfil de usuario.
    // Ejemplos de otros campos que podrías tener:
    // @ApiPropertyOptional({ example: 'user@example.com' }) 
    // email?: string; // El email generalmente viene del endpoint /auth/me o está en la tabla users
    // @ApiPropertyOptional({ example: '2023-01-15T10:30:00Z' })
    // created_at?: Date;
    // @ApiPropertyOptional({ example: '2023-01-16T11:00:00Z' })
    // updated_at?: Date;
} 