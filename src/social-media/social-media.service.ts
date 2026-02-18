import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateSocialMediaDto } from './dto/create-social-media.dto';
import { UpdateSocialMediaDto } from './dto/update-social-media.dto';
import { PrismaService } from 'prisma/prisma.service';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class SocialMediaService implements OnModuleInit {

  private readonly logger = new Logger('SocialMediaService');

  constructor(private readonly prisma: PrismaService){}

  onModuleInit() {
    this.logger.log('SocialMediaService initialized')
  }

  async create(createSocialMediaDto: CreateSocialMediaDto) {
    return await this.prisma.socialMedia.create({
      data: createSocialMediaDto
    })
  }

  async findAll() {
    return await this.prisma.socialMedia.findMany();
  }

  async findOne(id: string) {

    const socialMedia = await this.prisma.socialMedia.findFirst({
      where:{id}
    })

    if(!socialMedia){
      throw new RpcException({
        message: `SocialMedia with id ${id} not found`,
        status: 404
      })
    }
    return socialMedia
  }

  async update(id: string, updateSocialMediaDto: UpdateSocialMediaDto) {

    await this.findOne(id)

    const { id: _, ...data } = updateSocialMediaDto;

    return await this.prisma.socialMedia.update({
      where: {id},
      data
    })
  }

  async remove(id: string) {

    await this.findOne(id)

    if(!id){
      throw new Error(`SocialMedia with id ${id} not found`)
    }

    return await this.prisma.socialMedia.delete({
      where:{id}
    })
  }
}
