export class Course {
  private constructor(readonly value: string) {}

  static create(raw: string): Course {
    const trimmed = raw.trim();
    if (trimmed.length < 2) {
      const err = new Error('Curso invalido — minimo 2 caracteres');
      err.name = 'ValidationError';
      throw err;
    }
    return new Course(trimmed);
  }

  equals(other: Course): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
