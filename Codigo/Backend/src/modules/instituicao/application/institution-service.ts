import type { FastifyInstance } from 'fastify';
import { DomainErrors } from '../../../shared/errors/domain-errors.js';

export type CreateInstitutionInput = {
  name: string;
};

export type UpdateInstitutionInput = Partial<CreateInstitutionInput>;

export function createInstitutionService(app: FastifyInstance) {
  return {
    list() {
      return app.prisma.institution.findMany({
        orderBy: { name: 'asc' }
      });
    },

    findById(id: string) {
      return app.prisma.institution.findUnique({ where: { id } });
    },

    async findByIdOrThrow(id: string) {
      const institution = await app.prisma.institution.findUnique({ where: { id } });
      if (!institution) throw DomainErrors.institutionNotFound();
      return institution;
    },

    create(input: CreateInstitutionInput) {
      return app.prisma.institution.create({
        data: {
          name: input.name.trim()
        }
      });
    },

    async update(id: string, input: UpdateInstitutionInput) {
      const institution = await app.prisma.institution.findUnique({
        where: { id }
      });

      if (!institution) {
        return null;
      }

      return app.prisma.institution.update({
        where: { id },
        data: {
          name: input.name?.trim()
        }
      });
    },

    async delete(id: string) {
      const institution = await app.prisma.institution.findUnique({
        where: { id }
      });

      if (!institution) {
        return null;
      }

      await app.prisma.institution.delete({
        where: { id }
      });

      return institution;
    }
  };
}
