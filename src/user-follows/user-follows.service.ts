import { Injectable } from '@nestjs/common';
import { CreateUserFollowDto } from './dto/create-user-follow.dto';
import { UpdateUserFollowDto } from './dto/update-user-follow.dto';

@Injectable()
export class UserFollowsService {
  create(createUserFollowDto: CreateUserFollowDto) {
    return 'This action adds a new userFollow';
  }

  findAll() {
    return `This action returns all userFollows`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userFollow`;
  }

  update(id: number, updateUserFollowDto: UpdateUserFollowDto) {
    return `This action updates a #${id} userFollow`;
  }

  remove(id: number) {
    return `This action removes a #${id} userFollow`;
  }
}
