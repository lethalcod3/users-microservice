import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PasswordResetsSenderService } from './services/password-resets-sender.service';
import { MailDto } from './dto/mail.dto';
import { PasswordTokenDto } from './dto/password-token-dto';
import { PasswordResetTokenReceiverService } from './services/password-reset-token-receiver.service';

@Controller()
export class PasswordResetsController {
  constructor(
    private readonly passwordResetsSenderService: PasswordResetsSenderService,
    private readonly passwordUpdateService: PasswordResetTokenReceiverService
  ) {}

  @MessagePattern('updatePasswordReset')
  update(@Payload() passwordDto: PasswordTokenDto) {
    return this.passwordUpdateService.tokenReceiver(passwordDto);
  }

  @MessagePattern('sendPasswordReset')
  sendPasswordReset(@Payload() mailDto: MailDto) {
    return this.passwordResetsSenderService.psswrdResetSender(mailDto);
  }
}
