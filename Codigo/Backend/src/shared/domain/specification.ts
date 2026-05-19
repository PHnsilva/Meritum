/**
 * Specification Pattern — Reusable, composable query logic
 * Decouples query building from execution
 */

export interface Specification<T> {
  toSQL(): { where: Record<string, any>; orderBy?: Record<string, any>; take?: number; skip?: number };
}

export abstract class BaseSpecification<T> implements Specification<T> {
  protected where: Record<string, any> = {};
  protected orderBy?: Record<string, any>;
  protected take?: number;
  protected skip?: number;

  addWhere(field: string, value: any): this {
    this.where[field] = value;
    return this;
  }

  addOrderBy(field: string, direction: 'asc' | 'desc'): this {
    this.orderBy = { [field]: direction };
    return this;
  }

  addPagination(skip: number, take: number): this {
    this.skip = skip;
    this.take = take;
    return this;
  }

  toSQL() {
    return {
      where: this.where,
      orderBy: this.orderBy,
      take: this.take,
      skip: this.skip
    };
  }
}

/**
 * Example: Student specs
 */
export class StudentByEmailSpec extends BaseSpecification<any> {
  constructor(email: string) {
    super();
    this.addWhere('user', { email });
  }
}

export class StudentByInstitutionSpec extends BaseSpecification<any> {
  constructor(institutionId: string, skip = 0, take = 50) {
    super();
    this.addWhere('institutionId', institutionId);
    this.addPagination(skip, take);
    this.addOrderBy('createdAt', 'desc');
  }
}

export class StudentActiveCoinSpec extends BaseSpecification<any> {
  constructor(institutionId: string) {
    super();
    this.addWhere('institutionId', institutionId);
    this.addWhere('coinBalance', { gt: 0 });
  }
}
