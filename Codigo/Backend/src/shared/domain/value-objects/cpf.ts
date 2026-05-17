export class CPF {
  private constructor(readonly value: string) {}

  static create(raw: string): CPF {
    const digits = raw.replace(/\D/g, '');
    if (digits.length !== 11) {
      const err = new Error('CPF invalido — deve conter 11 digitos');
      err.name = 'ValidationError';
      throw err;
    }
    return new CPF(digits);
  }

  formatted(): string {
    return this.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  equals(other: CPF): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
