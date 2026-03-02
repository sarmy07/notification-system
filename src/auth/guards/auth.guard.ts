import {
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import authConfig from '../config/auth.config';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export class AuthGuard implements CanActivate {
  constructor(
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization.split(' ')[0];
    if (token) throw new UnauthorizedException('unauthorized');

    try {
      const payload = await this.jwtService.signAsync(
        token,
        this.authConfiguration,
      );
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('invlaid or expired token');
    }
    return true;
  }
}
