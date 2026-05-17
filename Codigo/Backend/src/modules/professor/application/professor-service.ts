import type { FastifyInstance } from 'fastify';
import { hashPassword } from '../../../shared/security/password-hasher.js';

export type CreateProfessorInput = {
  name: string;
  email: string;
  cpf: string;
  department: string;
  institutionId: string;
  password: string;
};

export type UpdateProfessorInput = Partial<Omit<CreateProfessorInput, 'password'>> & {
  password?: string;
};

export function createProfessorService(app: FastifyInstance) {
  async function ensureInstitutionExists(institutionId: string) {
    const institution = await app.prisma.institution.findUnique({ where: { id: institutionId } });
    if (!institution) {
      const error = new Error('Instituicao de ensino nao encontrada');
      error.name = 'InstitutionNotFoundError';
      throw error;
    }
  }

  return {
    list() {
      return app.prisma.professor.findMany({
        include: { user: true, institution: true },
        orderBy: { createdAt: 'desc' }
      });
    },

    findById(id: string) {
      return app.prisma.professor.findUnique({
        where: { id },
        include: { user: true, institution: true }
      });
    },

    async create(input: CreateProfessorInput) {
      await ensureInstitutionExists(input.institutionId);

      return app.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: input.name,
            email: input.email,
            cpf: input.cpf,
            passwordHash: hashPassword(input.password),
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
      if (input.institutionId) await ensureInstitutionExists(input.institutionId);

      const professor = await app.prisma.professor.findUnique({ where: { id }, include: { user: true } });
      if (!professor) return null;

      return app.prisma.$transaction(async (tx) => {
        if (input.name || input.email || input.cpf || input.password) {
          await tx.user.update({
            where: { id: professor.userId },
            data: {
              ...(input.name ? { name: input.name } : {}),
              ...(input.email ? { email: input.email } : {}),
              ...(input.cpf ? { cpf: input.cpf } : {}),
              ...(input.password ? { passwordHash: hashPassword(input.password) } : {})
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
