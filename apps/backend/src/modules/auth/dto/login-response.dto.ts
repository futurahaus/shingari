import { ApiProperty } from '@nestjs/swagger';

// Podrías tener un DTO más específico para el usuario si es necesario,
// pero por ahora usaremos un objeto genérico para el ejemplo.
class UserLoginResponseData {
    @ApiProperty({ example: 'user-uuid-12345', description: 'User unique ID' })
    id: string;

    @ApiProperty({ example: 'user@example.com', description: 'User email' })
    email: string;

    @ApiProperty({ example: 'email', description: 'Authentication provider' })
    provider: string;

    // Agrega otros campos de usuario que retornes y quieras documentar
}

export class LoginResponseDto {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        description: 'Access token for API authorization',
    })
    accessToken: string;

    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZS1yZWZyZXNoIjoiSm9obiBEb2UiLCJpYXQiOjE1MTYyMzkwMjJ9.QhvoqP0A9Z2X_7gQ8zQzRzG1fJ_0pP6oR_d1cE5vYl0',
        description: 'Refresh token to get a new access token',
    })
    refreshToken: string;

    @ApiProperty({ type: UserLoginResponseData, description: 'Authenticated user details' })
    user: UserLoginResponseData;
} 