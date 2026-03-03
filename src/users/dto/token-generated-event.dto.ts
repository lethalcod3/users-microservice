import {
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UserDto {
  @IsString()
  id!: string;

  @IsString()
  name!: string;

  @IsString()
  email!: string;

  @IsString()
  role!: string;
}

export class TokenGeneratedEventDto {
  @IsObject()
  @ValidateNested()
  @Type(() => UserDto)
  user!: UserDto;

  @IsString()
  @IsNotEmpty()
  token!: string;
}
