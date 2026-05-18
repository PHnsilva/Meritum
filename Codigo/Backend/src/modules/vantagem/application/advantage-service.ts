import { randomBytes } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { DomainErrors } from '../../../shared/errors/domain-errors.js';
import { sendStudentCouponEmail, sendPartnerRedemptionEmail } from '../../../shared/email/email-service.js';

export type CreateAdvantageInput = {
  title: string;
  description: string;
  imageUrl?: string;
  costInCoins: number;
};

export type UpdateAdvantageInput = Partial<CreateAdvantageInput & { isActive: boolean }>;

function generateCode(): string {
  return randomBytes(4).toString('hex').toUpperCase();
}

export function createAdvantageService(app: FastifyInstance) {
  return {
    async list() {
      return app.prisma.advantage.findMany({
        where: { isActive: true },
        include: { partner: { include: { user: true } } },
        orderBy: { createdAt: 'desc' }
      });
    },

    async listByPartner(partnerId: string) {
      return app.prisma.advantage.findMany({
        where: { partnerId },
        include: { partner: { include: { user: true } } },
        orderBy: { createdAt: 'desc' }
      });
    },

    async findById(id: string) {
      return app.prisma.advantage.findUnique({
        where: { id },
        include: { partner: { include: { user: true } } }
      });
    },

    async create(partnerId: string, input: CreateAdvantageInput) {
      return app.prisma.advantage.create({
        data: { ...input, partnerId },
        include: { partner: { include: { user: true } } }
      });
    },

    async update(id: string, partnerId: string, input: UpdateAdvantageInput) {
      const advantage = await app.prisma.advantage.findUnique({ where: { id } });
      if (!advantage) throw DomainErrors.advantageNotFound();
      if (advantage.partnerId !== partnerId) throw DomainErrors.advantageOwnership();

      return app.prisma.advantage.update({
        where: { id },
        data: input,
        include: { partner: { include: { user: true } } }
      });
    },

    async delete(id: string, requesterId: string, requesterRole: string) {
      const advantage = await app.prisma.advantage.findUnique({ where: { id } });
      if (!advantage) throw DomainErrors.advantageNotFound();
      if (requesterRole !== 'admin' && advantage.partnerId !== requesterId) {
        throw DomainErrors.advantageOwnership();
      }
      await app.prisma.advantage.delete({ where: { id } });
      return advantage;
    },

    async redeem(advantageId: string, studentId: string) {
      const advantage = await app.prisma.advantage.findUnique({
        where: { id: advantageId },
        include: { partner: { include: { user: true } } }
      });
      if (!advantage) throw DomainErrors.advantageNotFound();
      if (!advantage.isActive) throw DomainErrors.advantageInactive();

      const student = await app.prisma.student.findUnique({
        where: { id: studentId },
        include: { user: true }
      });
      if (!student) throw DomainErrors.studentNotFound();
      if (student.coinBalance < advantage.costInCoins) throw DomainErrors.insufficientBalance();

      const code = generateCode();

      const redemption = await app.prisma.$transaction(async (tx) => {
        await tx.student.update({
          where: { id: studentId },
          data: { coinBalance: { decrement: advantage.costInCoins } }
        });

        return tx.redemption.create({
          data: { code, coinCost: advantage.costInCoins, studentId, advantageId },
          include: { advantage: { include: { partner: { include: { user: true } } } }, student: { include: { user: true } } }
        });
      });

      void sendStudentCouponEmail(
        student.user.email,
        student.user.name,
        advantage.title,
        advantage.partner.corporateName,
        advantage.costInCoins,
        code
      );
      void sendPartnerRedemptionEmail(
        advantage.partner.user.email,
        advantage.partner.corporateName,
        student.user.name,
        advantage.title,
        advantage.costInCoins,
        code
      );

      return redemption;
    },

    async listRedemptionsByStudent(studentId: string) {
      return app.prisma.redemption.findMany({
        where: { studentId },
        include: { advantage: { include: { partner: true } } },
        orderBy: { createdAt: 'desc' }
      });
    }
  };
}
