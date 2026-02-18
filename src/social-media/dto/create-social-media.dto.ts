import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateSocialMediaDto {
    @IsString()
    @IsNotEmpty()
    userId!: string

    @IsString()
    @IsNotEmpty()
    url!: string
}
