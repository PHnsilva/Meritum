import type { PrismaClient } from '@prisma/client';
import { EmailVO } from '../../../shared/domain/value-objects/email-vo.js';
import { hashPassword } from '../../../shared/security/password-hasher.js';
import { paginate, toPaginatedResult } from '../../../shared/pagination/pagination.js';
import { sendPartnerApprovalEmail, sendPartnerRegistrationEmail } from '../../../shared/email/email-service.js';
import { DomainErrors } from '../../../shared/errors/domain-errors.js';
import type { PartnerRepository } from '../domain/partner.repository.js';

export type CreatePartnerCompanyInput = {
  corporateName: string;
  tradeName?: string;
  email: string;
  cnpj: string;
  address: string;
  password: string;
};

export type UpdatePartnerCompanyInput = Partial<CreatePartnerCompanyInput>;

export type RegisterPartnerCompanyInput = CreatePartnerCompanyInput;

export function createPartnerCompanyService(prisma: PrismaClient, partnerRepo: PartnerRepository) {
  return {
    async list(page = 1, limit = 50, status?: 'PENDING' | 'APPROVED') {
      const where = status ? { status } : undefined;
      const p = paginate(page, limit);
      const [data, total] = await Promise.all([
        prisma.partnerCompany.findMany({
          where,
          include: { user: true },
          orderBy: { createdAt: 'desc' },
          skip: p.skip,
          take: p.take
        }),
        prisma.partnerCompany.count({ where })
      ]);
      return toPaginatedResult(data, total, p.page, p.limit);
    },

    findById(id: string) {
      return prisma.partnerCompany.findUnique({
        where: { id },
        include: { user: true }
      });
    },

    create(input: CreatePartnerCompanyInput) {
      EmailVO.create(input.email);
      return prisma.$transaction(async (tx) => {
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
            address: input.address,
            status: 'APPROVED'
          },
          include: { user: true }
        });
      });
    },

    register(input: RegisterPartnerCompanyInput) {
      EmailVO.create(input.email);
      return prisma.$transaction(async (tx) => {
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
            address: input.address,
            status: 'PENDING'
          },
          include: { user: true }
        });
      }).then((partner) => {
        void sendPartnerRegistrationEmail(partner.user.email, partner.corporateName);
        return partner;
      });
    },

    async approve(id: string) {
      const partner = await partnerRepo.findById(id);
      if (!partner) throw DomainErrors.partnerNotFound();

      const updated = await prisma.partnerCompany.update({
        where: { id },
        data: { status: 'APPROVED' },
        include: { user: true }
      });

      void sendPartnerApprovalEmail(partner.user.email, partner.corporateName);

      return updated;
    },

    async update(id: string, input: UpdatePartnerCompanyInput) {
      if (input.email) EmailVO.create(input.email);
      const partnerCompany = await prisma.partnerCompany.findUnique({ where: { id }, include: { user: true } });
      if (!partnerCompany) return null;

      return prisma.$transaction(async (tx) => {
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
      const partnerCompany = await prisma.partnerCompany.findUnique({ where: { id } });
      if (!partnerCompany) return null;
      await prisma.user.delete({ where: { id: partnerCompany.userId } });
      return partnerCompany;
    }
  };
}
