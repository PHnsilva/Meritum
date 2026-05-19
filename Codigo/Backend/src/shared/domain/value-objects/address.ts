export class Address {
  private constructor(readonly value: string) {}

  static create(raw: string): Address {
    const trimmed = raw.trim();
    if (trimmed.length < 3) {
      const err = new Error('Endereco invalido — minimo 3 caracteres');
      err.name = 'ValidationError';
      throw err;
    }
    return new Address(trimmed);
  }

  equals(other: Address): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
