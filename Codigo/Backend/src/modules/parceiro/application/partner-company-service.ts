import type { FastifyInstance } from 'fastify';
import { hashPassword } from '../../../shared/security/password-hasher.js';

export type CreatePartnerCompanyInput = {
  corporateName: string;
  tradeName?: string;
  email: string;
  cnpj: string;
  address: string;
  password: string;
};

export type UpdatePartnerCompanyInput = Partial<CreatePartnerCompanyInput>;

export function createPartnerCompanyService(app: FastifyInstance) {
  return {
    list() {
      return app.prisma.partnerCompany.findMany({
        orderBy: { createdAt: 'desc' }
      });
    },

    findById(id: string) {
      return app.prisma.partnerCompany.findUnique({
        where: { id }
      });
    },

    create(input: CreatePartnerCompanyInput) {
      return app.prisma.partnerCompany.create({
        data: {
          corporateName: input.corporateName,
          tradeName: input.tradeName,
          email: input.email,
          cnpj: input.cnpj,
          address: input.address,
          passwordHash: hashPassword(input.password)
        }
      });
    },

    async update(id: string, input: UpdatePartnerCompanyInput) {
      const partnerCompany = await app.prisma.partnerCompany.findUnique({ where: { id } });

      if (!partnerCompany) {
        return null;
      }

      return app.prisma.partnerCompany.update({
        where: { id },
        data: {
          corporateName: input.corporateName,
          tradeName: input.tradeName,
          email: input.email,
          cnpj: input.cnpj,
          address: input.address,
          ...(input.password ? { passwordHash: hashPassword(input.password) } : {})
        }
      });
    },

    async delete(id: string) {
      const partnerCompany = await app.prisma.partnerCompany.findUnique({ where: { id } });

      if (!partnerCompany) {
        return null;
      }

      await app.prisma.partnerCompany.delete({ where: { id } });
      return partnerCompany;
    }
  };
}
