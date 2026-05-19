import { CoinBalance } from '../../../shared/domain/value-objects/coin-balance.js';
import { CPF } from '../../../shared/domain/value-objects/cpf.js';
import { EmailVO } from '../../../shared/domain/value-objects/email-vo.js';
import { RG } from '../../../shared/domain/value-objects/rg.js';
import { Address } from '../../../shared/domain/value-objects/address.js';
import { Course } from '../../../shared/domain/value-objects/course.js';

export class StudentEntity {
  private _coinBalance: number;

  constructor(
    readonly id: string,
    readonly institutionId: string,
    readonly cpf: CPF,
    readonly email: EmailVO,
    readonly rg: RG,
    readonly address: Address,
    readonly course: Course,
    readonly user: { name: string; email: string },
    coinBalance: number
  ) {
    this._coinBalance = coinBalance;
  }

  get coinBalance(): number { return this._coinBalance; }

  creditCoins(amount: number): number {
    this._coinBalance = CoinBalance.create(this._coinBalance).add(amount).value;
    return this._coinBalance;
  }

  debitCoins(amount: number): number {
    const balance = CoinBalance.create(this._coinBalance);
    if (balance.value < amount) {
      const err = new Error('Saldo insuficiente para debitar moedas');
      err.name = 'InsufficientBalanceError';
      throw err;
    }
    this._coinBalance = balance.deduct(amount).value;
    return this._coinBalance;
  }

  ensureCanRedeem(costInCoins: number): void {
    if (this._coinBalance < costInCoins) {
      const err = new Error(`Saldo insuficiente: requer ${costInCoins} moedas, tem ${this._coinBalance}`);
      err.name = 'InsufficientBalanceError';
      throw err;
    }
  }

  updateProfile(data: { address?: Address; rg?: RG }): void {
    if (data.address) (this as any).address = data.address;
    if (data.rg) (this as any).rg = data.rg;
  }
}
