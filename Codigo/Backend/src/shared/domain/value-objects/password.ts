import { hashPassword, verifyPassword } from '../../../shared/security/password-hasher.js';

export class Password {
  private constructor(readonly hash: string) {}

  static create(raw: string): Password {
    if (raw.length < 6) {
      const err = new Error('Senha deve ter minimo 6 caracteres');
      err.name = 'ValidationError';
      throw err;
    }
    return new Password(hashPassword(raw));
  }

  static fromHash(hash: string): Password {
    return new Password(hash);
  }

  verify(raw: string): boolean {
    return verifyPassword(raw, this.hash);
  }

  equals(other: Password): boolean {
    return this.hash === other.hash;
  }

  toString(): string {
    return this.hash;
  }
}
