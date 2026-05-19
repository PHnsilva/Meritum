import { CPF } from '../../../shared/domain/value-objects/cpf.js';
import { EmailVO } from '../../../shared/domain/value-objects/email-vo.js';
import { hashPassword } from '../../../shared/security/password-hasher.js';
import { paginate, toPaginatedResult } from '../../../shared/pagination/pagination.js';
import type { StudentRepository } from '../domain/student.repository.js';

export type CreateStudentInput = {
  name: string;
  email: string;
  cpf: string;
  rg: string;
  address: string;
  institutionId: string;
  course: string;
  password: string;
};

export type UpdateStudentInput = Partial<Omit<CreateStudentInput, 'password'>> & {
  password?: string;
};

export function createStudentService(studentRepo: StudentRepository) {
  return {
    async list(institutionId?: string, page = 1, limit = 50) {
      const p = paginate(page, limit);
      const [data, total] = await Promise.all([
        studentRepo.list(institutionId, p.skip, p.take),
        studentRepo.count(institutionId)
      ]);
      return toPaginatedResult(data, total, p.page, p.limit);
    },

    findById(id: string) {
      return studentRepo.findById(id);
    },

    async create(input: CreateStudentInput) {
      EmailVO.create(input.email);
      CPF.create(input.cpf);
      const { password, ...rest } = input;
      return studentRepo.create({ ...rest, passwordHash: hashPassword(password) });
    },

    async update(id: string, input: UpdateStudentInput) {
      if (input.email) EmailVO.create(input.email);
      if (input.cpf) CPF.create(input.cpf);
      const { password, ...rest } = input;
      return studentRepo.update(id, {
        ...rest,
        ...(password ? { passwordHash: hashPassword(password) } : {})
      });
    },

    delete(id: string) {
      return studentRepo.delete(id);
    }
  };
}
