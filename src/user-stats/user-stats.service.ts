import { Injectable } from '@nestjs/common';
import { CreateUserStatDto } from './dto/create-user-stat.dto';
import { UpdateUserStatDto } from './dto/update-user-stat.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserStats } from './schemas/user-stats.schema';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';

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
    if (!stats)
      throw new RpcException({ message: 'Stats not found', statusCode: 404 });
    return stats;
  }

  async incrementProfileViews(sqlUserId: string) {
    return await this.userStatsModel
      .findOneAndUpdate(
        { sqlUserId },
        { $inc: { profileViews: 1 } },
        { new: true } // retorna el documento actualizado
      )
      .exec();
  }
}
