import type { FastifyInstance } from 'fastify';
import { CPF } from '../../../shared/domain/value-objects/cpf.js';
import { EmailVO } from '../../../shared/domain/value-objects/email-vo.js';
import { DomainErrors } from '../../../shared/errors/domain-errors.js';
import { generateTempPassword, hashPassword } from '../../../shared/security/password-hasher.js';
import { paginate, toPaginatedResult } from '../../../shared/pagination/pagination.js';
import { createInstitutionService } from '../../instituicao/application/institution-service.js';

export type CreateProfessorInput = {
  name: string;
  email: string;
  cpf: string;
  department: string;
  institutionId: string;
};

export type UpdateProfessorInput = Partial<CreateProfessorInput>;

export function createProfessorService(app: FastifyInstance) {
  const institutionService = createInstitutionService(app);

  return {
    async list(page = 1, limit = 50) {
      const p = paginate(page, limit);
      const [data, total] = await Promise.all([
        app.prisma.professor.findMany({
          include: { user: true, institution: true },
          orderBy: { createdAt: 'desc' },
          skip: p.skip,
          take: p.take
        }),
        app.prisma.professor.count()
      ]);
      return toPaginatedResult(data, total, p.page, p.limit);
    },

    findById(id: string) {
      return app.prisma.professor.findUnique({
        where: { id },
        include: { user: true, institution: true }
      });
    },

    async create(input: CreateProfessorInput) {
      EmailVO.create(input.email);
      CPF.create(input.cpf);
      await institutionService.findByIdOrThrow(input.institutionId);

      return app.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: input.name,
            email: input.email,
            cpf: input.cpf,
            passwordHash: hashPassword(generateTempPassword()),
            mustChangePassword: true,
            role: 'PROFESSOR'
          }
        });

        return tx.professor.create({
          data: {
            userId: user.id,
            department: input.department,
            institutionId: input.institutionId
          },
          include: { user: true, institution: true }
        });
      });
    },

    async update(id: string, input: UpdateProfessorInput) {
      if (input.email) EmailVO.create(input.email);
      if (input.cpf) CPF.create(input.cpf);
      if (input.institutionId) await institutionService.findByIdOrThrow(input.institutionId);

      const professor = await app.prisma.professor.findUnique({ where: { id }, include: { user: true } });
      if (!professor) return null;

      return app.prisma.$transaction(async (tx) => {
        if (input.name || input.email || input.cpf) {
          await tx.user.update({
            where: { id: professor.userId },
            data: {
              ...(input.name ? { name: input.name } : {}),
              ...(input.email ? { email: input.email } : {}),
              ...(input.cpf ? { cpf: input.cpf } : {})
            }
          });
        }

        return tx.professor.update({
          where: { id },
          data: {
            ...(input.department ? { department: input.department } : {}),
            ...(input.institutionId ? { institutionId: input.institutionId } : {})
          },
          include: { user: true, institution: true }
        });
      });
    },

    async delete(id: string) {
      const professor = await app.prisma.professor.findUnique({ where: { id } });
      if (!professor) return null;
      await app.prisma.user.delete({ where: { id: professor.userId } });
      return professor;
    }
  };
}
