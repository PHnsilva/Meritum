export class RG {
  private constructor(readonly value: string) {}

  static create(raw: string): RG {
    const trimmed = raw.trim();
    if (trimmed.length < 3) {
      const err = new Error('RG invalido — minimo 3 caracteres');
      err.name = 'ValidationError';
      throw err;
    }
    return new RG(trimmed);
  }

  equals(other: RG): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
