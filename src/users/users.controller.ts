import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('createUser')
  create(@Payload() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @MessagePattern('findAllUsers')
  findAll() {
    return this.usersService.findAll();
  }

  @MessagePattern('findArtists')
  findArtists(@Payload() pagination: { limit?: number; offset?: number } = {}) {
    return this.usersService.findArtists(pagination ?? {});
  }

  @MessagePattern('findOneUser')
  findOne(@Payload(new ParseUUIDPipe()) id: string) {
    return this.usersService.findOne(id);
  }

  @MessagePattern('updateUser')
  update(@Payload() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto.id, updateUserDto);
  }

  @MessagePattern('removeUser')
  remove(@Payload(new ParseUUIDPipe()) id: string) {
    return this.usersService.remove(id);
  }

  @MessagePattern('findUserByEmail')
  findByEmail(@Payload() payload: { email: string }) {
    return this.usersService.findByEmail(payload.email);
  }

  @MessagePattern('generateToken')
  generateToken(@Payload() user: any) {
    return this.usersService.generateToken(user);
  }

  @MessagePattern('createUserGoogle')
  createUserGoogle(@Payload() payload: any) {
    return this.usersService.createUserGoogle(payload);
  }

  @MessagePattern('login')
  login(@Payload() payload: { email: string; password: string }) {
    return this.usersService.login(payload);
  }

  @MessagePattern('deactivateUser')
  deactivate(@Payload(new ParseUUIDPipe()) id: string) {
    return this.usersService.deactivate(id);
  }

  @MessagePattern('addPassword')
  addPassword(@Payload() payload: { id: string; newPassword: string }) {
    return this.usersService.addPassword(payload.id, payload.newPassword);
  }

  // Escucha cuando un usuario publica contenido (post o evento)
  @EventPattern('user.publishedContent')
  handleUserPublishedContent(@Payload() data: { userId: string | number }) {
    // Aceptar tanto number como string por compatibilidad entre microservicios
    const userId = String((data as any).userId);
    return this.usersService.promoteToArtist(userId);
  }
}
