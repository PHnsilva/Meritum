import type { FastifyInstance } from 'fastify';
import { hashPassword } from '../../../shared/security/password-hasher.js';

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

export function createStudentService(app: FastifyInstance) {
  async function ensureInstitutionExists(institutionId: string) {
    const institution = await app.prisma.institution.findUnique({ where: { id: institutionId } });
    if (!institution) {
      const error = new Error('Instituicao de ensino nao encontrada');
      error.name = 'InstitutionNotFoundError';
      throw error;
    }
  }

  return {
    list(institutionId?: string) {
      return app.prisma.student.findMany({
        where: institutionId ? { institutionId } : undefined,
        include: { user: true, institution: true },
        orderBy: { createdAt: 'desc' }
      });
    },

    findById(id: string) {
      return app.prisma.student.findUnique({
        where: { id },
        include: { user: true, institution: true }
      });
    },

    async create(input: CreateStudentInput) {
      await ensureInstitutionExists(input.institutionId);

      return app.prisma.$transaction(async (tx) => {
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
      if (input.institutionId) await ensureInstitutionExists(input.institutionId);

      const student = await app.prisma.student.findUnique({ where: { id }, include: { user: true } });
      if (!student) return null;

      return app.prisma.$transaction(async (tx) => {
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
      const student = await app.prisma.student.findUnique({ where: { id } });
      if (!student) return null;
      await app.prisma.user.delete({ where: { id: student.userId } });
      return student;
    }
  };
}
