import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PasswordTokenDto } from '../dto/password-token-dto';
import { createHash } from 'node:crypto';
import { RpcExceptionHelper } from '../../common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordResetTokenReceiverService implements OnModuleInit {
  private readonly logger = new Logger('PasswordResetTokenReceiverService');

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.logger.log('PasswordResetTokenReceiverService initialized');
  }

  async tokenReceiver(psswrdTknDto: PasswordTokenDto) {
    const { password, token } = psswrdTknDto;

    const hashedToken = createHash('sha256').update(token).digest('hex');

    const tokenRecord = await this.prisma.passwordReset.findFirst({
      where: {
        token: hashedToken,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!tokenRecord) RpcExceptionHelper.badRequest('Invalid or expired token');

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: tokenRecord!.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordReset.update({
        where: { id: tokenRecord!.id },
        data: { used: true },
      }),
    ]);

    this.logger.log(`Password updated for user ${tokenRecord!.userId}`);
    return { message: 'Password updated successfully' };
  }
}
