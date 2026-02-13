import { Module } from '@nestjs/common';
import { PasswordResetsService } from './password-resets.service';
import { PasswordResetsController } from './password-resets.controller';

@Module({
  controllers: [PasswordResetsController],
  providers: [PasswordResetsService],
})
export class PasswordResetsModule {}
