import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserFollowsService } from './user-follows.service';
import { CreateUserFollowDto } from './dto/create-user-follow.dto';
import { UpdateUserFollowDto } from './dto/update-user-follow.dto';

@Controller()
export class UserFollowsController {
  constructor(private readonly userFollowsService: UserFollowsService) {}

  @MessagePattern('createUserFollow')
  create(@Payload() createUserFollowDto: CreateUserFollowDto) {
    return this.userFollowsService.create(createUserFollowDto);
  }

  @MessagePattern('findAllUserFollows')
  findAll() {
    return this.userFollowsService.findAll();
  }

  @MessagePattern('findOneUserFollow')
  findOne(@Payload() id: number) {
    return this.userFollowsService.findOne(id);
  }

  @MessagePattern('updateUserFollow')
  update(@Payload() updateUserFollowDto: UpdateUserFollowDto) {
    return this.userFollowsService.update(updateUserFollowDto.id, updateUserFollowDto);
  }

  @MessagePattern('removeUserFollow')
  remove(@Payload() id: number) {
    return this.userFollowsService.remove(id);
  }
}
