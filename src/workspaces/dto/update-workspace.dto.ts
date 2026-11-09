import { IsHexColor, IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateWorkspaceDto {
  @IsString()
  @IsOptional()
  @MaxLength(80)
  name?: string

  @IsString()
  @IsOptional()
  icon?: string

  @IsHexColor()
  @IsOptional()
  color?: string
}
