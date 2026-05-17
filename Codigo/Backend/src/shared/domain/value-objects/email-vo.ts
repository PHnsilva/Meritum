export class EmailVO {
  private constructor(readonly value: string) {}

  static create(raw: string): EmailVO {
    const trimmed = raw.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      const err = new Error('Email invalido');
      err.name = 'ValidationError';
      throw err;
    }
    return new EmailVO(trimmed);
  }

  equals(other: EmailVO): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
