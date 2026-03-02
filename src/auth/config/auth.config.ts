import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  refresh_secret: process.env.JWT_REFRESH_SECRET,
  refresh_expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '1d',
}));
