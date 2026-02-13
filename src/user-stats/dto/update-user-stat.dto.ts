import { PartialType } from '@nestjs/mapped-types';
import { CreateUserStatDto } from './create-user-stat.dto';

export class UpdateUserStatDto extends PartialType(CreateUserStatDto) {
  id: number;
}
