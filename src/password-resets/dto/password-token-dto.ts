import { IsNotEmpty, IsString } from 'class-validator';

export class PasswordTokenDto {
  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  token!: string;
}
