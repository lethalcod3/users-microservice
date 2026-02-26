import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserStatsModule } from 'src/user-stats/user-stats.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [UserStatsModule],
})
export class UsersModule {}
