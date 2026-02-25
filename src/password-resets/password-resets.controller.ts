import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PasswordResetsService } from './password-resets.service';
import { PasswordResetsSenderService } from './password-resets-sender.service';
import { CreatePasswordResetDto } from './dto/create-password-reset.dto';
import { UpdatePasswordResetDto } from './dto/update-password-reset.dto';
import { MailDto } from './dto/mail.dto';

@Controller()
export class PasswordResetsController {
  constructor(
    private readonly passwordResetsService: PasswordResetsService,
    private readonly passwordResetsSenderService: PasswordResetsSenderService,
  ) {}

  @MessagePattern('createPasswordReset')
  create(@Payload() createPasswordResetDto: CreatePasswordResetDto) {
    return this.passwordResetsService.create(createPasswordResetDto);
  }

  @MessagePattern('findAllPasswordResets')
  findAll() {
    return this.passwordResetsService.findAll();
  }

  @MessagePattern('findOnePasswordReset')
  findOne(@Payload() id: string) {
    return this.passwordResetsService.findOne(id);
  }

  @MessagePattern('updatePasswordReset')
  update(@Payload() updatePasswordResetDto: UpdatePasswordResetDto) {
    return this.passwordResetsService.update(
      updatePasswordResetDto.id,
      updatePasswordResetDto,
    );
  }

  @MessagePattern('removePasswordReset')
  remove(@Payload() id: string) {
    return this.passwordResetsService.remove(id);
  }

  @MessagePattern('sendPasswordReset')
  sendPasswordReset(@Payload() mailDto: MailDto) {
    return this.passwordResetsSenderService.psswrdResetSender(mailDto);
  }
}
