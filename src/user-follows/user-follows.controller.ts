import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserFollowsService } from './user-follows.service';
import { CreateUserFollowDto } from './dto/create-user-follow.dto';

@Controller()
export class UserFollowsController {
  constructor(private readonly userFollowsService: UserFollowsService) {}

  @MessagePattern('toggleUserFollow')
  toggleFollow(@Payload() createUserFollowDto: CreateUserFollowDto) {
    return this.userFollowsService.toggleFollow(createUserFollowDto);
  }

  @MessagePattern('findAllUserFollows')
  findAll(@Payload() followerId: string) {
    return this.userFollowsService.findAll(followerId);
  }

  @MessagePattern('findOneUserFollow')
  findOne(@Payload() payload: { followerId: string; followedId: string }) {
    return this.userFollowsService.findOne(
      payload.followerId,
      payload.followedId
    );
  }

  @MessagePattern('findFollowers')
  findFollowers(@Payload() payload: { userId: string }) {
    return this.userFollowsService.findFollowers(payload.userId);
  }
}
