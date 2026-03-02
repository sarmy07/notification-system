export abstract class HashingProvider {
  abstract hashPassword(pass: string): Promise<string>;

  abstract comparePassword(pass: string, hashedPass: string): Promise<boolean>;
}
