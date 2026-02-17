import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UsersService implements OnModuleInit {

  private readonly logger = new Logger('UsersService');

  constructor(private readonly prisma: PrismaService) { }

  onModuleInit() {
    this.logger.log('UsersService initialized')
  }

  async create(createUserDto: CreateUserDto) {
    return await this.prisma.user.create({
      data: createUserDto
    })
  }

  async findAll() {
    return await this.prisma.user.findMany()
  }

  async findOne(id: string) {

    const user = await this.prisma.user.findFirst({
      where: {
        id
      }
    })

    if (!user) {
      throw new Error(`User with id ${id} not found`)
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id)

    if (!id) {
      throw new Error(`User with id ${id} not found`)
    }

    const { id: _, ...data } = updateUserDto;

    return await this.prisma.user.update({
      where: { id },
      data
    })
  }

  async remove(id: string) {
    await this.findOne(id)

    if (!id) {
      throw new Error(`User with id ${id} not found`)
    }

    return await this.prisma.user.delete({
      where: { id }
    })

  }
}