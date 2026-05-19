import { CoinBalance } from '../../../shared/domain/value-objects/coin-balance.js';
import { CPF } from '../../../shared/domain/value-objects/cpf.js';
import { EmailVO } from '../../../shared/domain/value-objects/email-vo.js';
import { Department } from '../../../shared/domain/value-objects/department.js';

export class ProfessorEntity {
  private _coinBalance: number;
  private _mustChangePassword: boolean;

  constructor(
    readonly id: string,
    readonly institutionId: string,
    readonly cpf: CPF,
    readonly email: EmailVO,
    readonly department: Department,
    readonly user: { name: string; email: string },
    coinBalance: number,
    mustChangePassword = false
  ) {
    this._coinBalance = coinBalance;
    this._mustChangePassword = mustChangePassword;
  }

  get coinBalance(): number { return this._coinBalance; }
  get mustChangePassword(): boolean { return this._mustChangePassword; }

  debitCoins(amount: number): number {
    const balance = CoinBalance.create(this._coinBalance);
    if (balance.value < amount) {
      const err = new Error('Saldo insuficiente para enviar moedas');
      err.name = 'InsufficientBalanceError';
      throw err;
    }
    this._coinBalance = balance.deduct(amount).value;
    return this._coinBalance;
  }

  creditCoins(amount: number): number {
    this._coinBalance = CoinBalance.create(this._coinBalance).add(amount).value;
    return this._coinBalance;
  }

  markPasswordAsChanged(): void {
    this._mustChangePassword = false;
  }

  sameInstitutionAs(other: { institutionId: string }): boolean {
    return this.institutionId === other.institutionId;
  }
}
