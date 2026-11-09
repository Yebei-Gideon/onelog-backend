import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class LoginDto {
    @IsEmail({}, { message: 'Invalid email address' })
    email!: string

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    password!: string

    @IsBoolean()
    @IsOptional()
    rememberMe?: boolean
}