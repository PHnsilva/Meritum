import type { PrismaClient } from '@prisma/client';
import { CPF } from '../../../shared/domain/value-objects/cpf.js';
import { EmailVO } from '../../../shared/domain/value-objects/email-vo.js';
import { DomainErrors } from '../../../shared/errors/domain-errors.js';
import { hashPassword } from '../../../shared/security/password-hasher.js';
import { paginate, toPaginatedResult } from '../../../shared/pagination/pagination.js';
import { createInstitutionService } from '../../instituicao/application/institution-service.js';

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

export function createStudentService(prisma: PrismaClient) {
  const institutionService = createInstitutionService(prisma);

  return {
    async list(institutionId?: string, page = 1, limit = 50) {
      const where = institutionId ? { institutionId } : undefined;
      const p = paginate(page, limit);
      const [data, total] = await Promise.all([
        prisma.student.findMany({
          where,
          include: { user: true, institution: true },
          orderBy: { createdAt: 'desc' },
          skip: p.skip,
          take: p.take
        }),
        prisma.student.count({ where })
      ]);
      return toPaginatedResult(data, total, p.page, p.limit);
    },

    findById(id: string) {
      return prisma.student.findUnique({
        where: { id },
        include: { user: true, institution: true }
      });
    },

    async create(input: CreateStudentInput) {
      EmailVO.create(input.email);
      CPF.create(input.cpf);
      await institutionService.findByIdOrThrow(input.institutionId);

      return prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: input.name,
            email: input.email,
            cpf: input.cpf,
            passwordHash: hashPassword(input.password),
            role: 'STUDENT'
          }
        });

        return tx.student.create({
          data: {
            userId: user.id,
            rg: input.rg,
            address: input.address,
            course: input.course,
            institutionId: input.institutionId
          },
          include: { user: true, institution: true }
        });
      });
    },

    async update(id: string, input: UpdateStudentInput) {
      if (input.email) EmailVO.create(input.email);
      if (input.cpf) CPF.create(input.cpf);
      if (input.institutionId) await institutionService.findByIdOrThrow(input.institutionId);

      const student = await prisma.student.findUnique({ where: { id }, include: { user: true } });
      if (!student) return null;

      return prisma.$transaction(async (tx) => {
        if (input.name || input.email || input.cpf || input.password) {
          await tx.user.update({
            where: { id: student.userId },
            data: {
              ...(input.name ? { name: input.name } : {}),
              ...(input.email ? { email: input.email } : {}),
              ...(input.cpf ? { cpf: input.cpf } : {}),
              ...(input.password ? { passwordHash: hashPassword(input.password) } : {})
            }
          });
        }

        return tx.student.update({
          where: { id },
          data: {
            ...(input.rg ? { rg: input.rg } : {}),
            ...(input.address ? { address: input.address } : {}),
            ...(input.course ? { course: input.course } : {}),
            ...(input.institutionId ? { institutionId: input.institutionId } : {})
          },
          include: { user: true, institution: true }
        });
      });
    },

    async delete(id: string) {
      const student = await prisma.student.findUnique({ where: { id } });
      if (!student) return null;
      await prisma.user.delete({ where: { id: student.userId } });
      return student;
    }
  };
}
