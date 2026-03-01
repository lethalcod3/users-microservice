import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { CreateUserFollowDto } from './dto/create-user-follow.dto';
import { PrismaService } from 'prisma/prisma.service';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { envs } from 'src/config';

@Injectable()
export class UserFollowsService implements OnModuleInit {
  private readonly logger = new Logger('UserFollowsService');

  private client: ClientProxy;

  constructor(private readonly prisma: PrismaService) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [envs.rabbit_url],
        queue: 'riff_queue',
        queueOptions: { durable: true },
      },
    });
  }

  onModuleInit() {
    this.logger.log('UserFollowsService initialized');
  }

  async toggleFollow(createUserFollowDto: CreateUserFollowDto) {
    const { followerId, followedId } = createUserFollowDto;

    if (followerId === followedId) {
      throw new BadRequestException('Un usuario no puede seguirse a sí mismo');
    }

    const existing = await this.findOne(followerId, followedId);

    if (existing) {
      await this.prisma.userFollows.delete({
        where: {
          followerId_followedId: { followerId, followedId },
        },
      });

      // ECST: emitir evento follow.removed
      this.client.emit('follow.removed', {
        follower_id: followerId,
        followed_id: followedId,
      });
      this.logger.log(`Emitted follow.removed: ${followerId} -> ${followedId}`);

      return {
        following: false,
        message: `Se dejo de seguir al usuario ${followedId}`,
      };
    }

    await this.prisma.userFollows.create({
      data: { followerId, followedId },
    });

    // ECST: obtener datos del follower y emitir evento follow.created
    const follower = await this.prisma.user.findUnique({
      where: { id: followerId },
      select: { email: true, name: true },
    });

    this.client.emit('follow.created', {
      follower_id: followerId,
      follower_email: follower!.email,
      follower_name: follower!.name,
      followed_id: followedId,
    });
    this.logger.log(`Emitted follow.created: ${followerId} -> ${followedId}`);

    return {
      following: true,
      message: `Ahora se sigue al usuario ${followedId}`,
    };
  }

  async findAll(followerId: string) {
    return await this.prisma.userFollows.findMany({
      where: { followerId },
    });
  }

  async findOne(followerId: string, followedId: string) {
    return await this.prisma.userFollows.findUnique({
      where: {
        followerId_followedId: { followerId, followedId },
      },
    });
  }

  async findFollowers(userId: string): Promise<string[]> {
    const follows = await this.prisma.userFollows.findMany({
      where: { followedId: userId },
      select: { followerId: true },
    });
    return follows.map((f) => f.followerId);
  }
}
