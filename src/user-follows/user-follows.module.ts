import { Module } from '@nestjs/common';
import { UserFollowsService } from './user-follows.service';
import { UserFollowsController } from './user-follows.controller';
import { CommonModule } from 'src/common';

@Module({
  imports: [CommonModule],
  controllers: [UserFollowsController],
  providers: [UserFollowsService],
})
export class UserFollowsModule {}
