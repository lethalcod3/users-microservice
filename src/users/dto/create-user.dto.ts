import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { UserRole } from "@prisma/client";
import { UserRoleList } from "../enum/user.enum";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;

    @IsString()
    @IsOptional()
    googleId?: string;

    @IsString()
    @IsOptional()
    biography?: string;

    @IsOptional()
    @IsEnum(UserRoleList, {
        message: `role must be one of the following values: ${UserRoleList}}`
    })
    role: UserRole = UserRole.USER
}