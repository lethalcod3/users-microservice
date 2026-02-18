import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SocialMediaService } from './social-media.service';
import { CreateSocialMediaDto } from './dto/create-social-media.dto';
import { UpdateSocialMediaDto } from './dto/update-social-media.dto';

@Controller()
export class SocialMediaController {
  constructor(private readonly socialMediaService: SocialMediaService) {}

  @MessagePattern('createSocialMedia')
  create(@Payload() createSocialMediaDto: CreateSocialMediaDto) {
    return this.socialMediaService.create(createSocialMediaDto);
  }

  @MessagePattern('findAllSocialMedia')
  findAll() {
    return this.socialMediaService.findAll();
  }

  @MessagePattern('findOneSocialMedia')
  findOne(@Payload(new ParseUUIDPipe()) id: string) {
    return this.socialMediaService.findOne(id);
  }

  @MessagePattern('updateSocialMedia')
  update(@Payload() updateSocialMediaDto: UpdateSocialMediaDto) {
    return this.socialMediaService.update(updateSocialMediaDto.id, updateSocialMediaDto);
  }

  @MessagePattern('removeSocialMedia')
  remove(@Payload(new ParseUUIDPipe()) id: string) {
    return this.socialMediaService.remove(id);
  }
}
