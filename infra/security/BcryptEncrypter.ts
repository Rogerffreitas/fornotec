import bcrypt from 'bcryptjs';
import { Encrypter } from '../../domain/application/infra/Encrypter';

const SALT_ROUNDS = 8;

export class BcryptEncrypter implements Encrypter {
  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, SALT_ROUNDS);
  }

  async compare(plainText: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }
}
