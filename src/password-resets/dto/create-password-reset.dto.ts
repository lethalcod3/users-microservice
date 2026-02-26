import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreatePasswordResetDto {

    @IsString()
    @IsNotEmpty()
    userId!: string
    
    @IsString()
    @IsNotEmpty()
    token!: string

    @IsDateString()
    expiresAt!: Date

    @IsBoolean()
    @IsOptional()
    used!: boolean
}