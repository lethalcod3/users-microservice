import { IsEmail, IsNotEmpty, ValidateIf } from 'class-validator';

export class MailDto {
  @ValidateIf((o) => !o.mail)
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  // Backward compatibility with older clients using "mail"
  @ValidateIf((o) => !o.email)
  @IsEmail()
  @IsNotEmpty()
  mail?: string;
}
