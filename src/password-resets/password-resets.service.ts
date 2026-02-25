import { Injectable } from '@nestjs/common';
import { CreatePasswordResetDto } from './dto/create-password-reset.dto';
import { UpdatePasswordResetDto } from './dto/update-password-reset.dto';
import { PrismaService } from 'prisma/prisma.service';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class PasswordResetsService {

  constructor(
    private readonly prisma: PrismaService
  ){}

  async create(createPasswordResetDto: CreatePasswordResetDto) {
    return await this.prisma.passwordReset.create({
      data: createPasswordResetDto
    })
  }

  async findAll() {
    return await this.prisma.passwordReset.findMany({
      orderBy: {createdAt: 'desc'}
    })
  }

  async findOne(id: string) {
     const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { id }
    })

    if(!id){
      throw new RpcException({
        status: 404,
        message: 'Password reset not found'
      })
    }
    return passwordReset
  }

  async update(id: string, updatePasswordResetDto: UpdatePasswordResetDto) {
    return await this.prisma.passwordReset.update({
      where: { id },
      data: updatePasswordResetDto
    })
  }

  async remove(id: string) {
    return await this.prisma.passwordReset.delete({
      where: { id }
    })
  }
}
