// src/platforms/platforms.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { Request } from 'express'
import { CreatePlatformDto } from './dto/create-platform.dto.js'
import { QueryPlatformDto } from './dto/query-platform.dto.js'
import { UpdatePlatformDto } from './dto/update-platform.dto.js'
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard.js'
import { PlatformsService } from './platforms.service.js'

@Controller('platforms')
export class PlatformsController {
  constructor(private readonly platformsService: PlatformsService) { }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Query() query: QueryPlatformDto, @Req() req: Request) {
    const user = req.user as { id?: string } | undefined
    return this.platformsService.findAll(query, user?.id)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.platformsService.findOne(id)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: CreatePlatformDto, @Req() req: Request) {
    return this.platformsService.create(dto, (req.user as { id: string }).id)
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() dto: UpdatePlatformDto, @Req() req: Request) {
    return this.platformsService.update(id, dto, (req.user as { id: string }).id)
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.platformsService.remove(id, (req.user as { id: string }).id)
  }
}