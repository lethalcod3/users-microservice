import { Module } from '@nestjs/common';
import { UserStatsService } from './user-stats.service';
import { UserStatsController } from './user-stats.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserStats, UserStatsSchema } from './schemas/user-stats.schema';

@Module({
  controllers: [UserStatsController],
  providers: [UserStatsService],
  imports: [
    MongooseModule.forFeature([
      { name: UserStats.name, schema: UserStatsSchema },
    ]),
  ],
  exports: [UserStatsService],
})
export class UserStatsModule {}
