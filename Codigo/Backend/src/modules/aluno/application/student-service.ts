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
    const institution = await app.prisma.institution.findUnique({
      where: { id: institutionId }
    });

    if (!institution) {
      const error = new Error('Instituicao de ensino nao encontrada');
      error.name = 'InstitutionNotFoundError';
      throw error;
    }
  }

  return {
    list() {
      return app.prisma.student.findMany({
        include: { institution: true },
        orderBy: { createdAt: 'desc' }
      });
    },

    findById(id: string) {
      return app.prisma.student.findUnique({
        where: { id },
        include: { institution: true }
      });
    },

    async create(input: CreateStudentInput) {
      await ensureInstitutionExists(input.institutionId);

      return app.prisma.student.create({
        data: {
          name: input.name,
          email: input.email,
          cpf: input.cpf,
          rg: input.rg,
          address: input.address,
          institutionId: input.institutionId,
          course: input.course,
          passwordHash: hashPassword(input.password)
        },
        include: { institution: true }
      });
    },

    async update(id: string, input: UpdateStudentInput) {
      if (input.institutionId) {
        await ensureInstitutionExists(input.institutionId);
      }

      const student = await app.prisma.student.findUnique({ where: { id } });

      if (!student) {
        return null;
      }

      return app.prisma.student.update({
        where: { id },
        data: {
          name: input.name,
          email: input.email,
          cpf: input.cpf,
          rg: input.rg,
          address: input.address,
          institutionId: input.institutionId,
          course: input.course,
          ...(input.password ? { passwordHash: hashPassword(input.password) } : {})
        },
        include: { institution: true }
      });
    },

    async delete(id: string) {
      const student = await app.prisma.student.findUnique({ where: { id } });

      if (!student) {
        return null;
      }

      await app.prisma.student.delete({ where: { id } });
      return student;
    }
  };
}
