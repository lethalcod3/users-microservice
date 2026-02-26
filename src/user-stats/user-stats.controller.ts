import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserStatsService } from './user-stats.service';

@Controller()
export class UserStatsController {
  constructor(private readonly userStatsService: UserStatsService) {}

  @MessagePattern('findUserStats')
  findOne(@Payload() sqlUserId: string) {
    return this.userStatsService.findOne(sqlUserId);
  }

  @MessagePattern('incrementProfileViews')
  incrementProfileViews(@Payload() sqlUserId: string) {
    return this.userStatsService.incrementProfileViews(sqlUserId);
  }
}
