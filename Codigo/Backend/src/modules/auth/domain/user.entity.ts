import { EmailVO } from '../../../shared/domain/value-objects/email-vo.js';
import { Password } from '../../../shared/domain/value-objects/password.js';
import type { Role } from '../../../shared/domain/role.js';

export class UserEntity {
  private _mustChangePassword: boolean;

  constructor(
    readonly id: string,
    readonly email: EmailVO,
    readonly role: Role,
    readonly password: Password,
    mustChangePassword: boolean = false
  ) {
    this._mustChangePassword = mustChangePassword;
  }

  get mustChangePassword(): boolean {
    return this._mustChangePassword;
  }

  get passwordHash(): string {
    return this.password.hash;
  }

  verifyPassword(raw: string): boolean {
    return this.password.verify(raw);
  }

  changePassword(newRaw: string, currentRaw: string): void {
    if (!this.verifyPassword(currentRaw)) {
      const err = new Error('Senha atual incorreta');
      err.name = 'AuthenticationError';
      throw err;
    }

    if (currentRaw === newRaw) {
      const err = new Error('Nova senha nao pode ser igual a atual');
      err.name = 'ValidationError';
      throw err;
    }

    Object.assign(this, { password: Password.create(newRaw) });
    this._mustChangePassword = false;
  }

  setTemporaryPassword(tempPassword: Password): void {
    Object.assign(this, { password: tempPassword });
    this._mustChangePassword = true;
  }

  changeInitialPassword(newRaw: string): void {
    Object.assign(this, { password: Password.create(newRaw) });
    this._mustChangePassword = false;
  }

  markPasswordAsChanged(): void {
    this._mustChangePassword = false;
  }

  canChangePassword(): boolean {
    return this._mustChangePassword;
  }
}
