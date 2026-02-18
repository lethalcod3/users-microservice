import { IsNotEmpty, IsString, IsUUID } from "class-validator"

export class CreateUserFollowDto {
    @IsString()
    @IsNotEmpty()
    followerId!: string

    @IsString()
    @IsNotEmpty()
    followedId!: string
}