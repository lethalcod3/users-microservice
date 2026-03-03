import { Module } from '@nestjs/common';
import { PasswordResetsSenderService } from './services/password-resets-sender.service';
import { PasswordResetTokenReceiverService } from './services/password-reset-token-receiver.service';
import { PasswordResetsController } from './password-resets.controller';
import { CommonModule } from '../common';

@Module({
  imports: [CommonModule],
  controllers: [PasswordResetsController],
  providers: [PasswordResetsSenderService, PasswordResetTokenReceiverService],
})
export class PasswordResetsModule {}
