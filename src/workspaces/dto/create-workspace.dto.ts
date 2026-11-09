import { IsHexColor, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string

  @IsString()
  @IsOptional()
  icon?: string

  @IsHexColor()
  @IsOptional()
  color?: string
}
