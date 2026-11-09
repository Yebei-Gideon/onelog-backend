// src/platforms/dto/create-platform.dto.ts
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
} from 'class-validator'

export class CreatePlatformDto {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  @IsOptional()
  slug?: string

  @IsString()
  @IsOptional()
  logo?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsUrl({}, { message: 'Invalid URL format' })
  url!: string

  @IsString()
  @IsOptional()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: 'Must be a valid hex color (e.g., #1DA1F2)' })
  color?: string

  @IsUUID()
  categoryId!: string

  @IsUUID()
  @IsOptional()
  statusId?: string

  @IsString()
  @IsOptional()
  badge?: string

  @IsString()
  @IsOptional()
  monthlyUsers?: string

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[]
}