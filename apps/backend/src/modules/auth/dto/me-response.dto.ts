import { ApiProperty } from '@nestjs/swagger';

export class MeResponseDto {
    @ApiProperty({ example: 'user-uuid-123', description: 'User ID' })
    id: string;

    @ApiProperty({ example: 'user@example.com', description: 'User email' })
    email: string;
    // Añade otros campos que `req.user` pueda tener y quieras exponer, por ejemplo:
    // @ApiPropertyOptional({ example: 'email', description: 'Authentication provider' })
    // provider?: string;
} 