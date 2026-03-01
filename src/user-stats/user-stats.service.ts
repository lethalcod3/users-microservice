import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserStats } from './schemas/user-stats.schema';
import { Model } from 'mongoose';
import { RpcExceptionHelper } from 'src/common';

@Injectable()
export class UserStatsService {
  constructor(
    @InjectModel(UserStats.name)
    private readonly userStatsModel: Model<UserStats>
  ) {}

  async create(sqlUserId: string) {
    return await this.userStatsModel.create({ sqlUserId, profileViews: 0 });
  }

  async findOne(sqlUserId: string) {
    const stats = await this.userStatsModel.findOne({ sqlUserId }).exec();
    if (!stats) RpcExceptionHelper.notFound('Stats', sqlUserId);
    return stats!;
  }

  async incrementProfileViews(sqlUserId: string) {
    return await this.userStatsModel
      .findOneAndUpdate(
        { sqlUserId },
        { $inc: { profileViews: 1 } },
        { new: true }
      )
      .exec();
  }
}
