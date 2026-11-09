import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'

export class QueryPlatformDto {
  @IsString()
  @IsOptional()
  category?: string

  @IsString()
  @IsOptional()
  status?: string

  @IsString()
  @IsOptional()
  search?: string

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isFeatured?: boolean
}