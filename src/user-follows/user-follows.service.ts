import { 
  BadRequestException, 
  Injectable, 
  Logger, 
  NotFoundException, 
  OnModuleInit 
} from '@nestjs/common';
import { CreateUserFollowDto } from './dto/create-user-follow.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UserFollowsService implements OnModuleInit {

  private readonly logger = new Logger('UserFollowsService');

  constructor(private readonly prisma: PrismaService) {}

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
          followerId_followedId: { followerId, followedId }
        }
      });
      return { following: false, message: `Se dejo de seguir al usuario ${followedId}` };
    }

    await this.prisma.userFollows.create({
      data: { followerId, followedId }
    });

    return { following: true, message: `Ahora se sigue al usuario ${followedId}` };
  }

  async findAll(followerId: string) {
    return await this.prisma.userFollows.findMany({
      where: { followerId }
    });
  }

  async findOne(followerId: string, followedId: string) {
    return await this.prisma.userFollows.findUnique({
      where: {
        followerId_followedId: { followerId, followedId }
      }
    });
  }
}