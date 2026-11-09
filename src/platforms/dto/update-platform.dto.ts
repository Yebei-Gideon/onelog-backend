import { PartialType } from '@nestjs/mapped-types'
import { CreatePlatformDto } from '#platforms/dto/create-platform.dto.js'

export class UpdatePlatformDto extends PartialType(CreatePlatformDto) {}