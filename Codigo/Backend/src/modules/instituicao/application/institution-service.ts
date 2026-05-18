import type { PrismaClient } from '@prisma/client';
import { DomainErrors } from '../../../shared/errors/domain-errors.js';

export type CreateInstitutionInput = {
  name: string;
};

export type UpdateInstitutionInput = Partial<CreateInstitutionInput>;

export function createInstitutionService(prisma: PrismaClient) {
  return {
    list() {
      return prisma.institution.findMany({
        orderBy: { name: 'asc' }
      });
    },

    findById(id: string) {
      return prisma.institution.findUnique({ where: { id } });
    },

    async findByIdOrThrow(id: string) {
      const institution = await prisma.institution.findUnique({ where: { id } });
      if (!institution) throw DomainErrors.institutionNotFound();
      return institution;
    },

    create(input: CreateInstitutionInput) {
      return prisma.institution.create({
        data: {
          name: input.name.trim()
        }
      });
    },

    async update(id: string, input: UpdateInstitutionInput) {
      const institution = await prisma.institution.findUnique({
        where: { id }
      });

      if (!institution) {
        return null;
      }

      return prisma.institution.update({
        where: { id },
        data: {
          name: input.name?.trim()
        }
      });
    },

    async delete(id: string) {
      const institution = await prisma.institution.findUnique({
        where: { id }
      });

      if (!institution) {
        return null;
      }

      await prisma.institution.delete({
        where: { id }
      });

      return institution;
    }
  };
}
