import { AuthGuard } from '@nestjs/passport';

export class JwtAuthuard extends AuthGuard('jwt') {}
