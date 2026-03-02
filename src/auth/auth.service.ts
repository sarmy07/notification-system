import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create.user.dto';
import { UsersService } from 'src/users/users.service';
import { HashingProvider } from './providers/hashing.provider';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import authConfig from './config/auth.config';
import type { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
    private readonly userService: UsersService,
    private readonly hashingProvider: HashingProvider,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(dto: CreateUserDto) {
    const existingUser = await this.userService.findOneByEmail(dto.email);
    if (existingUser) throw new ConflictException('email in use');

    const hash = await this.hashingProvider.hashPassword(dto.password);

    const user = await this.userService.createUser({
      ...dto,
      password: hash,
    });

    const { password, ...result } = user;
    return {
      message: 'Signup success',
      user: result,
    };
  }

  async loginUser(dto: LoginDto) {
    const user = await this.userService.findOneByEmail(dto.email);
    if (!user) throw new NotFoundException('user not found');

    const valid = await this.hashingProvider.comparePassword(
      dto.password,
      user.password,
    );
    if (!valid) throw new BadRequestException('invalid credentials');

    const token = await this.generateToken(user);

    const { password, ...result } = user;

    return {
      message: 'Login success',
      user: result,
      token,
    };
  }

  private async generateToken(user: any) {
    const payload = {
      id: user.id,
      email: user.email,
    };

    const [accessToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.authConfiguration.secret,
        expiresIn: this.authConfiguration.expiresIn as any,
      }),
    ]);

    return { accessToken };
  }
}
