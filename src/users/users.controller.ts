import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create.user.dto';
import { get } from 'http';
import { UpdateUserReferenceDto } from './dto/update.user.reference.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Patch('preferences')
  updateUserReference(@Body() dto: UpdateUserReferenceDto, @Req() req) {
    return this.userService.updateUserPrefernce(dto, req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }
}
