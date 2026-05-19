import { CoinBalance } from '../../../shared/domain/value-objects/coin-balance.js';

export class ProfessorEntity {
  private _coinBalance: number;

  constructor(
    readonly id: string,
    readonly institutionId: string,
    readonly user: { name: string; email: string },
    coinBalance: number
  ) {
    this._coinBalance = coinBalance;
  }

  get coinBalance(): number { return this._coinBalance; }

  debitCoins(amount: number): number {
    this._coinBalance = CoinBalance.create(this._coinBalance).deduct(amount).value;
    return this._coinBalance;
  }

  sameInstitutionAs(other: { institutionId: string }): boolean {
    return this.institutionId === other.institutionId;
  }
}
