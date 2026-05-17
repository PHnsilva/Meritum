export class CoinBalance {
  private constructor(readonly value: number) {}

  static create(amount: number): CoinBalance {
    if (!Number.isInteger(amount) || amount < 0) {
      const err = new Error('Saldo de moedas invalido — deve ser um inteiro nao negativo');
      err.name = 'ValidationError';
      throw err;
    }
    return new CoinBalance(amount);
  }

  static zero(): CoinBalance {
    return new CoinBalance(0);
  }

  canDeduct(amount: number): boolean {
    return this.value >= amount;
  }

  deduct(amount: number): CoinBalance {
    if (!this.canDeduct(amount)) {
      const err = new Error('Saldo insuficiente para realizar o envio');
      err.name = 'InsufficientBalanceError';
      throw err;
    }
    return new CoinBalance(this.value - amount);
  }

  add(amount: number): CoinBalance {
    return new CoinBalance(this.value + amount);
  }

  toString(): string {
    return String(this.value);
  }
}
