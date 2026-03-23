import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateUserFollowDto } from './dto/create-user-follow.dto';
import { PrismaService } from 'prisma/prisma.service';
import { RpcExceptionHelper, PublisherService } from 'src/common';

@Injectable()
export class UserFollowsService implements OnModuleInit {
  private readonly logger = new Logger('UserFollowsService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly publisher: PublisherService
  ) {}

  onModuleInit() {
    this.logger.log('UserFollowsService initialized');
  }

  async toggleFollow(createUserFollowDto: CreateUserFollowDto) {
    const { followerId, followedId } = createUserFollowDto;

    if (followerId === followedId) {
      RpcExceptionHelper.badRequest('Un usuario no puede seguirse a sí mismo');
    }

    const existing = await this.findOne(followerId, followedId);

    if (existing) {
      await this.prisma.userFollows.delete({
        where: {
          followerId_followedId: { followerId, followedId },
        },
      });

      // ECST: emitir evento follow.removed
      await this.publisher.publish('follow.removed', {
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

    if (!follower) {
      this.logger.warn(
        `Follower ${followerId} not found, skipping follow.created event`
      );
      return {
        following: true,
        message: `Ahora se sigue al usuario ${followedId}`,
      };
    }

    await this.publisher.publish('follow.created', {
      follower_id: followerId,
      follower_email: follower.email,
      follower_name: follower.name,
      followed_id: followedId,
    });
    this.logger.log(`Emitted follow.created: ${followerId} -> ${followedId}`);

    return {
      following: true,
      message: `Ahora se sigue al usuario ${followedId}`,
    };
  }

  async removeFollow(
    followerId: string,
    followedId: string
  ): Promise<{ following: boolean; message: string }> {
    const existing = await this.findOne(followerId, followedId);

    if (!existing) {
      RpcExceptionHelper.notFound('Follow', `${followerId} -> ${followedId}`);
    }

    await this.prisma.userFollows.delete({
      where: { followerId_followedId: { followerId, followedId } },
    });

    await this.publisher.publish('follow.removed', {
      follower_id: followerId,
      followed_id: followedId,
    });
    this.logger.log(`Emitted follow.removed: ${followerId} -> ${followedId}`);

    return {
      following: false,
      message: `Se dejó de seguir al usuario ${followedId}`,
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

  /**
   * Retorna todos los registros de follows donde el usuario es el seguido
   * (es decir, todos los seguidores de followingId).
   * El gateway recibe el query param `followingId` → mapeado a `followedId` en DB.
   */
  async findFollowersByUser(followingId: string) {
    return await this.prisma.userFollows.findMany({
      where: { followedId: followingId },
      select: {
        followerId: true,
        followedId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Retorna todos los registros de follows donde el usuario es el seguidor
   * (es decir, todos los usuarios que followerId sigue).
   * El gateway recibe el query param `followerId` → mapeado a `followerId` en DB.
   */
  async findFollowingByUser(followerId: string) {
    return await this.prisma.userFollows.findMany({
      where: { followerId },
      select: {
        followerId: true,
        followedId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findFollowersTotalByUser(userId: string) {
    if (!userId?.trim()) {
      RpcExceptionHelper.badRequest('userId is required');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, status: true },
      select: { id: true },
    });

    if (!user) RpcExceptionHelper.notFound('User', userId);

    const result = await this.prisma.$queryRaw<
      Array<{ total_followers: number | bigint | string }>
    >`SELECT get_total_followers_by_user(${userId}) AS total_followers`;

    const totalFollowers = Number(result[0]?.total_followers ?? 0);

    return {
      userId,
      totalFollowers,
    };
  }
}
