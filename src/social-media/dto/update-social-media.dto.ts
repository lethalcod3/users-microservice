import { PartialType } from '@nestjs/mapped-types';
import { CreateSocialMediaDto } from './create-social-media.dto';
import { IsString } from 'class-validator';

export class UpdateSocialMediaDto extends PartialType(CreateSocialMediaDto) {
  @IsString()
  id!: string;
}
