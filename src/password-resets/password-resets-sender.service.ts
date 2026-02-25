import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { MailDto } from './dto/mail.dto';
import {
  RpcException,
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { randomBytes, createHash } from 'node:crypto';
import { envs } from 'src/config';

@Injectable()
export class PasswordResetsSenderService implements OnModuleInit {
  private readonly logger = new Logger('PsswrdResetService');
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
    this.logger.log('PsswrdResetService');
  }

  async psswrdResetSender(mailDto: MailDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: mailDto.mail },
    });

    if (!user) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'user not found',
      });
    } else {
      //Generación del token
      const rawToken = (size: number = 32): string => {
        return randomBytes(size).toString('hex');
      };

      //Hasheo
      const hashing = (generateToken: string) => {
        return createHash('sha256').update(generateToken).digest('hex');
      };

      const hashedToken = hashing(rawToken());

      await this.prisma.passwordReset.create({
        data: {
          userId: user.id,
          token: hashedToken,
          expiresAt: new Date(Date.now() + 900_000),
        },
      });

      this.logger.log('Enviando evento a RabbitMQ: send.resetPassword', {
        mail: user.email,
        userId: user.id,
        userName: user.name,
        token: hashedToken,
      });
      this.client.emit('send.resetPassword', {
        mail: user.email,
        userId: user.id,
        userName: user.name,
        token: hashedToken,
      });

      this.logger.log('Evento emitido a RabbitMQ: send.resetPassword');
      return { status: HttpStatus.OK, message: 'Password reset email sent' };
    }
  }
}
