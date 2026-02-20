import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import { UserStatsService } from 'src/user-stats/user-stats.service';
import * as jwt from 'jsonwebtoken';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UsersService implements OnModuleInit {

  private readonly logger = new Logger('UsersService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly userStatsService: UserStatsService
  ) { }

  onModuleInit() {
    this.logger.log('UsersService initialized')
  }

  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: createUserDto
    })

    await this.userStatsService.create(user.id)
    
    return user
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

  async findByEmail(email: string) {
  const user = await this.prisma.user.findFirst({
    where: { email }
  });

  if (!user) {
    throw new RpcException({
      message: `User with email ${email} not found`,
      statusCode: 404
    });
  }

  return user;
}

  generateToken(user: any) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '10s' }
  );
  }

  async createUserGoogle(payload: any) {
    // Verificar si ya existe por googleId
    const existingUser = await this.prisma.user.findFirst({
      where: { googleId: payload.googleId }
    });

    if (existingUser) return existingUser;

    // Crear usuario nuevo
    const user = await this.prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        googleId: payload.googleId,
        password: '',
        role: payload.role ?? 'USER'
      }
    });

    await this.userStatsService.create(user.id);
    return user;
  }


  async login(payload: { email: string; password: string }) {
    const user = await this.prisma.user.findFirst({
      where: { email: payload.email }
    });

    if (!user) {
      throw new RpcException({
        message: 'Credenciales incorrectas',
        statusCode: 401
      });
    }

    // Verificar contraseña
    const isPasswordValid = payload.password === user.password;

    if (!isPasswordValid) {
      throw new RpcException({
        message: 'Credenciales incorrectas',
        statusCode: 401
      });
    }

    // Generar token
    const token = this.generateToken(user);
    return { token, user };
  }

}