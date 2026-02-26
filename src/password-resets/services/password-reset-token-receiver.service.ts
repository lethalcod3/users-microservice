import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PasswordTokenDto } from '../dto/password-token-dto';
import { createHash } from 'node:crypto';

@Injectable()
export class PasswordResetTokenReceiverService implements OnModuleInit {
  private readonly logger = new Logger('PasswordResetTokenReceiverService');

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.logger.log('initialized');
  }

  async tokenReceiver(psswrdTknDto: PasswordTokenDto) {
    const { password, token } = psswrdTknDto;

    const hashing = (generateToken: string) =>
      createHash('sha256').update(generateToken).digest('hex');

    const hashedToken = hashing(token);

    if (
      !(await this.prisma.passwordReset.findFirst({
        where: { token: hashedToken },
      }))
    )
      try {
        const tokenAprovall = await this.prisma.passwordReset.findFirstOrThrow({
          where: {
            token: hashedToken,
            used: false,
            expiresAt: { gt: new Date() },
          },
        });

        // Update user password and mark token as used in a transaction
        await this.prisma.$transaction([
          this.prisma.user.update({
            where: { id: tokenAprovall.userId },
            data: { password },
          }),
          this.prisma.passwordReset.update({
            where: { id: tokenAprovall.id },
            data: { used: true } as any,
          }),
        ]);

        return { status: HttpStatus.OK, message: 'Password updated' };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.warn('Token lookup or update failed', message);
        throw new HttpException(
          'Invalid or expired token',
          HttpStatus.BAD_REQUEST
        );
      }
  }
}
