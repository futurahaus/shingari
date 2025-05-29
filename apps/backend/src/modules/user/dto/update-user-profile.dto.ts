import { IsString, IsOptional, IsDate, IsEnum, IsBoolean, IsUUID, Length, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export enum Gender {
  M = 'M',
  F = 'F',
  O = 'O',
}

export class UpdateUserProfileDto {
  @IsString()
  @Length(1, 100)
  first_name: string;

  @IsString()
  @Length(1, 100)
  last_name: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  city?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  province?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  country?: string;

  @IsString()
  @IsOptional()
  @Length(1, 10)
  postal_code?: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  birth_date?: Date;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  @Matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, {
    message: 'Invalid phone number format',
  })
  phone?: string;

  @IsBoolean()
  accepted_terms: boolean;

  @IsUUID()
  uuid: string;
} 