import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { MailDto } from '../dto/mail.dto';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { randomBytes, createHash } from 'node:crypto';
import { envs } from '../../config';
import { RpcExceptionHelper } from '../../common';

@Injectable()
export class PasswordResetsSenderService implements OnModuleInit {
  private readonly logger = new Logger('PasswordResetsSenderService');
  private client: ClientProxy;

  constructor(private readonly prisma: PrismaService) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [envs.rabbit_url],
        queue: 'riff_queue',
      },
    });
  }

  onModuleInit() {
    this.logger.log('PasswordResetsSenderService initialized');
  }

  async psswrdResetSender(mailDto: MailDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: mailDto.mail },
    });

    if (!user) RpcExceptionHelper.notFound('User', mailDto.mail);

    const rawToken = randomBytes(32).toString('hex');
    const hashedToken = createHash('sha256').update(rawToken).digest('hex');

    await this.prisma.passwordReset.create({
      data: {
        userId: user!.id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 900_000),
      },
    });

    this.client.emit('send.resetPassword', {
      mail: user!.email,
      userId: user!.id,
      userName: user!.name,
      token: rawToken,
    });

    this.logger.log('Evento emitido: send.resetPassword');
    return { message: 'Password reset email sent' };
  }
}
