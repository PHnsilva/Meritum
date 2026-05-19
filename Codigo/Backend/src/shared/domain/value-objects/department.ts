export class Department {
  private constructor(readonly value: string) {}

  static create(raw: string): Department {
    const trimmed = raw.trim();
    if (trimmed.length < 2) {
      const err = new Error('Departamento invalido — minimo 2 caracteres');
      err.name = 'ValidationError';
      throw err;
    }
    return new Department(trimmed);
  }

  equals(other: Department): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
