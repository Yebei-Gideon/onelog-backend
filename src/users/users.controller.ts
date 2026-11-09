import { Controller, Get, NotFoundException, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { Request } from 'express'
import { UsersService } from '#users/users.service.js'

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    async getProfile(@Req() req: Request) {
        const user = req.user as { id: string }
        const profile = await this.usersService.findById(user.id)

        if (!profile) {
            throw new NotFoundException('User account not found')
        }

        const { passwordHash: _, ...safeUser } = profile
        return safeUser
    }
}