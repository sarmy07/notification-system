import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create.user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthuard } from './guards/jwt.auth.gugard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.authService.registerUser(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.loginUser(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthuard)
  getMe(@Request() req) {
    return req.user;
  }
}
