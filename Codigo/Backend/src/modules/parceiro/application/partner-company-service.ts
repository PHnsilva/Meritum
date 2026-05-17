import type { FastifyInstance } from 'fastify';
import { EmailVO } from '../../../shared/domain/value-objects/email-vo.js';
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
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      });
    },

    findById(id: string) {
      return app.prisma.partnerCompany.findUnique({
        where: { id },
        include: { user: true }
      });
    },

    create(input: CreatePartnerCompanyInput) {
      EmailVO.create(input.email);
      return app.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: input.corporateName,
            email: input.email,
            passwordHash: hashPassword(input.password),
            role: 'PARTNER'
          }
        });

        return tx.partnerCompany.create({
          data: {
            userId: user.id,
            corporateName: input.corporateName,
            tradeName: input.tradeName,
            cnpj: input.cnpj,
            address: input.address
          },
          include: { user: true }
        });
      });
    },

    async update(id: string, input: UpdatePartnerCompanyInput) {
      if (input.email) EmailVO.create(input.email);
      const partnerCompany = await app.prisma.partnerCompany.findUnique({ where: { id }, include: { user: true } });
      if (!partnerCompany) return null;

      return app.prisma.$transaction(async (tx) => {
        if (input.email || input.password || input.corporateName) {
          await tx.user.update({
            where: { id: partnerCompany.userId },
            data: {
              ...(input.corporateName ? { name: input.corporateName } : {}),
              ...(input.email ? { email: input.email } : {}),
              ...(input.password ? { passwordHash: hashPassword(input.password) } : {})
            }
          });
        }

        return tx.partnerCompany.update({
          where: { id },
          data: {
            ...(input.corporateName ? { corporateName: input.corporateName } : {}),
            ...(input.tradeName !== undefined ? { tradeName: input.tradeName } : {}),
            ...(input.cnpj ? { cnpj: input.cnpj } : {}),
            ...(input.address ? { address: input.address } : {})
          },
          include: { user: true }
        });
      });
    },

    async delete(id: string) {
      const partnerCompany = await app.prisma.partnerCompany.findUnique({ where: { id } });
      if (!partnerCompany) return null;
      await app.prisma.user.delete({ where: { id: partnerCompany.userId } });
      return partnerCompany;
    }
  };
}
