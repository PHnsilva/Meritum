import { CPF } from '../../../shared/domain/value-objects/cpf.js';
import { EmailVO } from '../../../shared/domain/value-objects/email-vo.js';
import { generateTempPassword, hashPassword } from '../../../shared/security/password-hasher.js';
import { paginate, toPaginatedResult } from '../../../shared/pagination/pagination.js';
import type { ProfessorRepository } from '../domain/professor.repository.js';

export type CreateProfessorInput = {
  name: string;
  email: string;
  cpf: string;
  department: string;
  institutionId: string;
};

export type UpdateProfessorInput = Partial<CreateProfessorInput>;

export function createProfessorService(professorRepo: ProfessorRepository) {
  return {
    async list(page = 1, limit = 50, institutionId?: string) {
      const p = paginate(page, limit);
      const [data, total] = await Promise.all([
        professorRepo.list(p.skip, p.take, institutionId),
        professorRepo.count(institutionId)
      ]);
      return toPaginatedResult(data, total, p.page, p.limit);
    },

    findById(id: string) {
      return professorRepo.findById(id);
    },

    async create(input: CreateProfessorInput) {
      EmailVO.create(input.email);
      CPF.create(input.cpf);
      return professorRepo.create({
        ...input,
        passwordHash: hashPassword(generateTempPassword()),
        mustChangePassword: true
      });
    },

    async update(id: string, input: UpdateProfessorInput) {
      if (input.email) EmailVO.create(input.email);
      if (input.cpf) CPF.create(input.cpf);
      return professorRepo.update(id, input);
    },

    delete(id: string) {
      return professorRepo.delete(id);
    },

    async requestActivation(email: string) {
      const user = await professorRepo.findActivationUser(email);
      if (!user) return null;

      const tempPassword = generateTempPassword();
      await professorRepo.setTemporaryPassword(user.id, hashPassword(tempPassword));

      return { tempPassword, userName: user.name, userEmail: user.email };
    }
  };
}
