/**
 * Base Repository — Domain-specific query methods
 * Replaces generic findMany/findUnique with rich, named queries
 */

import type { Specification } from '../domain/specification.js';

export interface IRepository<T, ID> {
  findById(id: ID): Promise<T | null>;
  create(data: any): Promise<T>;
  update(id: ID, data: any): Promise<T | null>;
  delete(id: ID): Promise<T | null>;
}

export interface IQueryRepository<T> {
  /**
   * Domain-specific queries (replace generic findMany)
   */
  executeSpec(spec: Specification<T>): Promise<T[]>;
}

/**
 * Example: Domain Methods (to replace generic queries)
 *
 * ❌ Bad (generic):
 *   const students = await repo.findMany({ where: { institutionId, coinBalance: { gt: 0 } } });
 *
 * ✅ Good (domain-specific):
 *   const students = await repo.findStudentsWithCoinsByInstitution(institutionId);
 */

export interface StudentDomainMethods {
  /**
   * Find students who have coin balance
   */
  findWithActiveCoinsByInstitution(institutionId: string): Promise<any[]>;

  /**
   * Find by email within institution (prevents data leakage)
   */
  findByEmailInInstitution(email: string, institutionId: string): Promise<any | null>;

  /**
   * Count active students (with non-zero balance)
   */
  countActiveByInstitution(institutionId: string): Promise<number>;
}

export interface ProfessorDomainMethods {
  /**
   * Find professors who sent coins this month
   */
  findActiveCoinSendersByInstitution(institutionId: string): Promise<any[]>;

  /**
   * Find by department in institution
   */
  findByDepartmentInInstitution(department: string, institutionId: string): Promise<any[]>;
}

export interface PartnerDomainMethods {
  /**
   * Find approved partners only
   */
  findApprovedPartners(): Promise<any[]>;

  /**
   * Find partner by email (secure, no institution bleed)
   */
  findByEmailSecure(email: string): Promise<any | null>;
}
