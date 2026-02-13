import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserStatsService } from './user-stats.service';
import { CreateUserStatDto } from './dto/create-user-stat.dto';
import { UpdateUserStatDto } from './dto/update-user-stat.dto';

@Controller()
export class UserStatsController {
  constructor(private readonly userStatsService: UserStatsService) {}

  @MessagePattern('createUserStat')
  create(@Payload() createUserStatDto: CreateUserStatDto) {
    return this.userStatsService.create(createUserStatDto);
  }

  @MessagePattern('findAllUserStats')
  findAll() {
    return this.userStatsService.findAll();
  }

  @MessagePattern('findOneUserStat')
  findOne(@Payload() id: number) {
    return this.userStatsService.findOne(id);
  }

  @MessagePattern('updateUserStat')
  update(@Payload() updateUserStatDto: UpdateUserStatDto) {
    return this.userStatsService.update(updateUserStatDto.id, updateUserStatDto);
  }

  @MessagePattern('removeUserStat')
  remove(@Payload() id: number) {
    return this.userStatsService.remove(id);
  }
}
