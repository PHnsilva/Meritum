/**
 * ReadModel Builder Pattern — Type-safe DTO construction
 * Ensures consistent shape, prevents field leaks
 */

export interface ReadModelBuilder<T> {
  build(): T;
}

export abstract class BaseReadModelBuilder<T> implements ReadModelBuilder<T> {
  protected data: Partial<T> = {};

  protected set<K extends keyof T>(field: K, value: T[K]): this {
    this.data[field] = value;
    return this;
  }

  abstract build(): T;
}

/**
 * Example: Student ReadModel Builder
 */
export interface StudentReadModel {
  id: string;
  name: string;
  email: string;
  cpf: string;
  rg: string;
  address: string;
  course: string;
  coinBalance: number;
  institution: { id: string; name: string };
  createdAt: Date;
  updatedAt: Date;
}

export class StudentReadModelBuilder extends BaseReadModelBuilder<StudentReadModel> {
  setId(id: string): this {
    return this.set('id', id);
  }

  setName(name: string): this {
    return this.set('name', name);
  }

  setEmail(email: string): this {
    return this.set('email', email);
  }

  setCpf(cpf: string): this {
    return this.set('cpf', cpf);
  }

  setRg(rg: string): this {
    return this.set('rg', rg);
  }

  setAddress(address: string): this {
    return this.set('address', address);
  }

  setCourse(course: string): this {
    return this.set('course', course);
  }

  setCoinBalance(balance: number): this {
    return this.set('coinBalance', balance);
  }

  setInstitution(institution: { id: string; name: string }): this {
    return this.set('institution', institution);
  }

  setCreatedAt(date: Date): this {
    return this.set('createdAt', date);
  }

  setUpdatedAt(date: Date): this {
    return this.set('updatedAt', date);
  }

  build(): StudentReadModel {
    if (!this.data.id || !this.data.name) {
      throw new Error('StudentReadModel requires id and name');
    }
    return this.data as StudentReadModel;
  }
}
