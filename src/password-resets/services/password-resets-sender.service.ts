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

    const resetEventPayload = {
      mail: user!.email,
      userId: user!.id,
      userName: user!.name,
      token: rawToken,
      from: 'Riff <onboard@riffmx.lat>',
      fromName: 'Riff',
      fromEmail: 'onboard@riffmx.lat',
      source: 'users-ms',
    };

    this.logger.log(
      `Publicando send.resetPassword para userId=${user!.id} mail=${user!.email}`
    );

    await this.publisher.publish('send.resetPassword', resetEventPayload);

    this.logger.log('Evento emitido: send.resetPassword');
    // Include both id and userId for compatibility across gateway versions.
    return {
      message: 'Password reset email sent',
      id: user!.id,
      userId: user!.id,
      mail: user!.email,
      email: user!.email,
      userName: user!.name,
      from: 'Riff <onboard@riffmx.lat>',
    };
  }
}
