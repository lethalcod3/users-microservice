import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthEventsController } from './auth-events.controller';
import { UserStatsModule } from 'src/user-stats/user-stats.module';
import { CommonModule } from 'src/common';

@Module({
  controllers: [UsersController, AuthEventsController],
  providers: [UsersService],
  imports: [UserStatsModule, CommonModule],
})
export class UsersModule {}
