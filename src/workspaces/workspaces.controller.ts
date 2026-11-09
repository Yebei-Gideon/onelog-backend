import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { Request } from 'express'
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js'
import { AddWorkspacePlatformDto } from './dto/add-workspace-platform.dto.js'
import { UpdateWorkspaceDto } from './dto/update-workspace.dto.js'
import { WorkspacesService } from './workspaces.service.js'

@Controller('workspaces')
@UseGuards(AuthGuard('jwt'))
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  list(@Req() req: Request) {
    return this.workspacesService.list((req.user as { id: string }).id)
  }

  @Post()
  create(@Req() req: Request, @Body() dto: CreateWorkspaceDto) {
    return this.workspacesService.create((req.user as { id: string }).id, dto)
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateWorkspaceDto) {
    return this.workspacesService.update((req.user as { id: string }).id, id, dto)
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.workspacesService.remove((req.user as { id: string }).id, id)
  }

  @Post(':id/platforms')
  addPlatform(@Req() req: Request, @Param('id') id: string, @Body() dto: AddWorkspacePlatformDto) {
    return this.workspacesService.addPlatform((req.user as { id: string }).id, id, dto)
  }
}
