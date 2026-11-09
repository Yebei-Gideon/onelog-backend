import { IsOptional, IsString, IsUUID, IsUrl } from 'class-validator'

export class AddWorkspacePlatformDto {
  @IsUUID()
  platformId!: string

  @IsOptional()
  @IsUrl()
  customUrl?: string

  @IsOptional()
  @IsString()
  accountLabel?: string
}
