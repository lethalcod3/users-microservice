import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { MailDto } from '../dto/mail.dto';
import { randomBytes, createHash } from 'node:crypto';
import { RpcExceptionHelper, PublisherService } from '../../common';

@Injectable()
export class PasswordResetsSenderService implements OnModuleInit {
  private readonly logger = new Logger('PasswordResetsSenderService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly publisher: PublisherService
  ) {}

  onModuleInit() {
    this.logger.log('PasswordResetsSenderService initialized');
  }

  async psswrdResetSender(mailDto: MailDto) {
    const incomingEmail = mailDto.email ?? mailDto.mail;
    const normalizedEmail = incomingEmail?.trim().toLowerCase();

    if (!normalizedEmail)
      RpcExceptionHelper.badRequest('Email is required for password reset');

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) RpcExceptionHelper.notFound('User', normalizedEmail);

    const rawToken = randomBytes(32).toString('hex');
    const hashedToken = createHash('sha256').update(rawToken).digest('hex');

    await this.prisma.passwordReset.create({
      data: {
        userId: user!.id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 900_000),
      },
    });

    // eliminar antes de producción
    this.logger.log(`RAW TOKEN (solo para testing): ${rawToken}`);

    await this.publisher.publish('send.resetPassword', {
      mail: user!.email,
      userId: user!.id,
      userName: user!.name,
      token: rawToken,
    });

    this.logger.log('Evento emitido: send.resetPassword');
    return { message: 'Password reset email sent' };
  }
}
