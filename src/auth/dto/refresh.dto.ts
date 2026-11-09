import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class RefreshDto {
    @IsUUID()
    userId!: string

    @IsUUID()
    sessionId!: string

    @IsString()
    @IsNotEmpty()
    refreshToken!: string
}