import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import { UserStatsService } from 'src/user-stats/user-stats.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { envs } from '../config';
import { RpcExceptionHelper } from 'src/common';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger('UsersService');
  private client: ClientProxy;

  constructor(
    private readonly prisma: PrismaService,
    private readonly userStatsService: UserStatsService
  ) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [envs.rabbit_url],
        queue: 'riff_queue',
        queueOptions: { durable: true },
      },
    });
  }

  onModuleInit() {
    this.logger.log('UsersService initialized');
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: { email: createUserDto.email },
    });

    if (existingUser)
      RpcExceptionHelper.conflict(
        `User with email ${createUserDto.email} already exists`
      );

    const hashedPassword = createUserDto.password
      ? await bcrypt.hash(createUserDto.password, 10)
      : null;

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    await this.userStatsService.create(user.id);

    return user;
  }

  async findAll() {
    return await this.prisma.user.findMany({
      where: { status: true },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        status: true,
      },
    });

    if (!user) RpcExceptionHelper.notFound(`User`, id);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const { id: _, ...data } = updateUserDto;

    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return await this.prisma.user.delete({
      where: { id },
    });
  }

  async deactivate(id: string) {
    await this.findOne(id);

    const shortId = id.replace(/-/g, '').slice(1, 10);

    await this.prisma.user.update({
      where: { id },
      data: {
        status: false,
        name: `user${shortId}`,
        biography: 'no bio',
      },
    });

    this.client.emit('user.deactivated', { userId: id });
    this.logger.log(`User with id ${id} deactivaded`);

    return { message: 'Account deactivated succesfully' };
  }

  async addPassword(id: string, newPassword: string) {
    const user = await this.findOne(id);

    if (user!.password)
      RpcExceptionHelper.badRequest(`The user already has registered password`);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, status: true },
    });

    if (!user) RpcExceptionHelper.notFound('User', email);

    return user;
  }

  generateToken(user: any) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      envs.jwtSecret,
      { expiresIn: '24h' }
    );
  }

  async createUserGoogle(payload: any) {
    // Verificar si ya existe por googleId
    const existingUser = await this.prisma.user.findFirst({
      where: { googleId: payload.googleId },
    });

    if (existingUser) return existingUser;

    // Crear usuario nuevo
    const user = await this.prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        googleId: payload.googleId,
        password: null,
        role: payload.role ?? 'USER',
      },
    });

    await this.userStatsService.create(user.id);
    return user;
  }

  async login(payload: { email: string; password: string }) {
    const user = await this.prisma.user.findFirst({
      where: { email: payload.email, status: true },
    });

    if (!user) RpcExceptionHelper.unauthorized('Invalid Credentials');

    if (!user!.password)
      RpcExceptionHelper.badRequest('This account uses Google to login');

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(
      payload.password,
      user!.password!
    );

    if (!isPasswordValid)
      RpcExceptionHelper.unauthorized('Invalid Credentials');

    // Generar token
    const token = this.generateToken(user);
    return { token, user };
  }
}
