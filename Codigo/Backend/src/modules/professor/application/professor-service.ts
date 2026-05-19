import { CPF } from '../../../shared/domain/value-objects/cpf.js';
import { EmailVO } from '../../../shared/domain/value-objects/email-vo.js';
import { Department } from '../../../shared/domain/value-objects/department.js';
import { ProfessorEntity } from '../domain/professor.entity.js';
import { generateTempPassword, hashPassword } from '../../../shared/security/password-hasher.js';
import { paginate, toPaginatedResult } from '../../../shared/pagination/pagination.js';
import { eventBus } from '../../../shared/domain/events/event-bus.js';
import { ProfessorCriadoEvent } from '../../../shared/domain/events/professor-criado-event.js';
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
      const cpf = CPF.create(input.cpf);
      const email = EmailVO.create(input.email);
      const department = Department.create(input.department);

      const tempPassword = generateTempPassword();
      const professor = await professorRepo.create({
        ...input,
        passwordHash: hashPassword(tempPassword),
        mustChangePassword: true
      });
      eventBus.publish(new ProfessorCriadoEvent(professor.id, professor.user.name, professor.user.email, professor.institution.name, tempPassword));
      return professor;
    },

    async update(id: string, input: UpdateProfessorInput) {
      if (input.email) EmailVO.create(input.email);
      if (input.cpf) CPF.create(input.cpf);
      if (input.department) Department.create(input.department);
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
