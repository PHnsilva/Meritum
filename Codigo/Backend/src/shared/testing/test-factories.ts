/**
 * Test Factories — Build test data with valid domain objects
 */

import { CPF } from '../domain/value-objects/cpf.js';
import { EmailVO } from '../domain/value-objects/email-vo.js';
import { RG } from '../domain/value-objects/rg.js';
import { Address } from '../domain/value-objects/address.js';
import { Course } from '../domain/value-objects/course.js';
import { Department } from '../domain/value-objects/department.js';
import { Password } from '../domain/value-objects/password.js';
import { StudentEntity } from '../../modules/aluno/domain/student.entity.js';
import { ProfessorEntity } from '../../modules/professor/domain/professor.entity.js';
import { UserEntity } from '../../modules/auth/domain/user.entity.js';

/**
 * Usage in tests:
 *
 * ```ts
 * describe('StudentEntity', () => {
 *   it('debitCoins throws if insufficient balance', () => {
 *     const student = TestFactories.student({ coinBalance: 10 });
 *     expect(() => student.debitCoins(20)).toThrow();
 *   });
 * });
 * ```
 */

export class TestFactories {
  static user(overrides: Partial<{
    id: string;
    email: string;
    password: string;
    role: string;
    mustChangePassword: boolean;
  }> = {}) {
    return new UserEntity(
      overrides.id ?? 'test-user-123',
      EmailVO.create(overrides.email ?? 'user@test.com'),
      (overrides.role as any) ?? 'student',
      Password.create(overrides.password ?? 'password123'),
      overrides.mustChangePassword ?? false
    );
  }

  static student(overrides: Partial<{
    id: string;
    institutionId: string;
    cpf: string;
    email: string;
    rg: string;
    address: string;
    course: string;
    coinBalance: number;
  }> = {}) {
    return new StudentEntity(
      overrides.id ?? 'test-student-123',
      overrides.institutionId ?? 'test-inst-123',
      CPF.create(overrides.cpf ?? '12345678901'),
      EmailVO.create(overrides.email ?? 'student@test.com'),
      RG.create(overrides.rg ?? 'RG123456'),
      Address.create(overrides.address ?? 'Rua Test 123'),
      Course.create(overrides.course ?? 'Engenharia'),
      { name: 'Test Student', email: overrides.email ?? 'student@test.com' },
      { id: overrides.institutionId ?? 'test-inst-123', name: 'Test Institution' },
      overrides.coinBalance ?? 100
    );
  }

  static professor(overrides: Partial<{
    id: string;
    institutionId: string;
    cpf: string;
    email: string;
    department: string;
    coinBalance: number;
  }> = {}) {
    return new ProfessorEntity(
      overrides.id ?? 'test-prof-123',
      overrides.institutionId ?? 'test-inst-123',
      CPF.create(overrides.cpf ?? '98765432100'),
      EmailVO.create(overrides.email ?? 'prof@test.com'),
      Department.create(overrides.department ?? 'Computação'),
      { name: 'Test Professor', email: overrides.email ?? 'prof@test.com' },
      overrides.coinBalance ?? 1000
    );
  }
}

/**
 * Test Scenarios (End-to-End)
 */
/**
 * Test Scenarios — For use in vitest/jest tests
 * Usage: describe('Scenario', () => { const { professor, student } = SCENARIO.setup(); ... });
 */
export const TEST_SCENARIOS = {
  STUDENT_RECEIVES_COINS: {
    description: 'Student receives coins from professor',
    setup: () => ({
      professor: TestFactories.professor({ coinBalance: 500 }),
      student: TestFactories.student({ coinBalance: 100 })
    })
  },

  STUDENT_REDEEMS_ADVANTAGE: {
    description: 'Student redeems advantage with sufficient coins',
    setup: () => ({
      student: TestFactories.student({ coinBalance: 100 })
    })
  },

  PASSWORD_CHANGE_INVARIANT: {
    description: 'User cannot set password equal to current password',
    setup: () => ({
      user: TestFactories.user({ password: 'password123' })
    })
  }
};
