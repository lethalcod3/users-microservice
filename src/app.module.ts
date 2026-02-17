import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { SocialMediaModule } from './social-media/social-media.module';
import { PasswordResetsModule } from './password-resets/password-resets.module';
import { UserFollowsModule } from './user-follows/user-follows.module';
import { UserStatsModule } from './user-stats/user-stats.module';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [UsersModule, SocialMediaModule, PasswordResetsModule, UserFollowsModule, UserStatsModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
