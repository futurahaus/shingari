import { IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  CONSUMER = 'consumer',
  BUSINESS = 'business',
}

export class AssignRoleDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID (UUID)',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.CONSUMER,
    description: 'Role to assign to the user',
  })
  @IsEnum(UserRole)
  role: UserRole;
} 