import { IsString, IsOptional, IsDate, IsEnum, IsBoolean, IsUUID, Length, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum Gender {
  M = 'M',
  F = 'F',
  O = 'O',
}

export class UpdateUserProfileDto {
  @ApiProperty({ example: 'John', description: 'User first name', minLength: 1, maxLength: 100 })
  @IsString()
  @Length(1, 100)
  first_name: string;

  @ApiProperty({ example: 'Doe', description: 'User last name', minLength: 1, maxLength: 100 })
  @IsString()
  @Length(1, 100)
  last_name: string;

  @ApiPropertyOptional({ example: 'New York', description: 'City of residence', minLength: 1, maxLength: 100 })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  city?: string;

  @ApiPropertyOptional({ example: 'NY', description: 'Province or state of residence', minLength: 1, maxLength: 100 })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  province?: string;

  @ApiPropertyOptional({ example: 'USA', description: 'Country of residence', minLength: 1, maxLength: 100 })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  country?: string;

  @ApiPropertyOptional({ example: '10001', description: 'Postal code', minLength: 1, maxLength: 10 })
  @IsString()
  @IsOptional()
  @Length(1, 10)
  postal_code?: string;

  @ApiProperty({ enum: Gender, example: Gender.M, description: 'User gender' })
  @IsEnum(Gender)
  gender: Gender;

  @ApiPropertyOptional({ type: String, format: 'date-time', example: '1990-12-31T00:00:00.000Z', description: 'User birth date' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  birth_date?: Date;

  @ApiPropertyOptional({ example: '+12125551234', description: 'User phone number', pattern: '^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$' })
  @IsString()
  @IsOptional()
  @Length(1, 20)
  @Matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, {
    message: 'Invalid phone number format',
  })
  phone?: string;

  @ApiProperty({ example: true, description: 'Indicates if user accepted terms and conditions' })
  @IsBoolean()
  accepted_terms: boolean;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'User unique identifier (UUID)', format: 'uuid' })
  @IsUUID()
  uuid: string;
} 