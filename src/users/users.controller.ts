import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
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
}
