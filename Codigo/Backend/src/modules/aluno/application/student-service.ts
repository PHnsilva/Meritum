import { CPF } from '../../../shared/domain/value-objects/cpf.js';
import { EmailVO } from '../../../shared/domain/value-objects/email-vo.js';
import { RG } from '../../../shared/domain/value-objects/rg.js';
import { Address } from '../../../shared/domain/value-objects/address.js';
import { Course } from '../../../shared/domain/value-objects/course.js';
import { StudentEntity } from '../domain/student.entity.js';
import { hashPassword } from '../../../shared/security/password-hasher.js';
import { paginate, toPaginatedResult } from '../../../shared/pagination/pagination.js';
import { eventBus } from '../../../shared/domain/events/event-bus.js';
import { AlunoCriadoEvent } from '../../../shared/domain/events/aluno-criado-event.js';
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
      const cpf = CPF.create(input.cpf);
      const email = EmailVO.create(input.email);
      const rg = RG.create(input.rg);
      const address = Address.create(input.address);
      const course = Course.create(input.course);

      const { password, ...rest } = input;
      const student = await studentRepo.create({ ...rest, passwordHash: hashPassword(password) });
      eventBus.publish(new AlunoCriadoEvent(student.id, student.user.name, student.user.email, student.institution.name));
      return student;
    },

    async update(id: string, input: UpdateStudentInput) {
      if (input.email) EmailVO.create(input.email);
      if (input.cpf) CPF.create(input.cpf);
      if (input.rg) RG.create(input.rg);
      if (input.address) Address.create(input.address);
      if (input.course) Course.create(input.course);

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
