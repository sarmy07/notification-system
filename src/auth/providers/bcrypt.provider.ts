import { HashingProvider } from './hashing.provider';
import * as bcrypt from 'bcrypt';

export class BcryptProvider extends HashingProvider {
  async hashPassword(pass: string): Promise<string> {
    return await bcrypt.hash(pass, 10);
  }

  async comparePassword(pass: string, hashedPass: string): Promise<boolean> {
    return await bcrypt.compare(pass, hashedPass);
  }
}
