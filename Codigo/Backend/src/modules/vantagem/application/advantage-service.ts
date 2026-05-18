import { randomBytes } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';
import { DomainErrors } from '../../../shared/errors/domain-errors.js';
import { CoinBalance } from '../../../shared/domain/value-objects/coin-balance.js';
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

export function createAdvantageService(prisma: PrismaClient) {
  return {
    async list() {
      return prisma.advantage.findMany({
        where: { isActive: true },
        include: { partner: { include: { user: true } } },
        orderBy: { createdAt: 'desc' }
      });
    },

    async listByPartner(partnerId: string) {
      return prisma.advantage.findMany({
        where: { partnerId },
        include: { partner: { include: { user: true } } },
        orderBy: { createdAt: 'desc' }
      });
    },

    async findById(id: string) {
      return prisma.advantage.findUnique({
        where: { id },
        include: { partner: { include: { user: true } } }
      });
    },

    async create(partnerId: string, input: CreateAdvantageInput) {
      return prisma.advantage.create({
        data: { ...input, partnerId },
        include: { partner: { include: { user: true } } }
      });
    },

    async listAll() {
      return prisma.advantage.findMany({
        include: { partner: { include: { user: true } } },
        orderBy: { createdAt: 'desc' }
      });
    },

    async update(id: string, requesterId: string, requesterRole: string, input: UpdateAdvantageInput) {
      const advantage = await prisma.advantage.findUnique({ where: { id } });
      if (!advantage) throw DomainErrors.advantageNotFound();
      if (requesterRole !== 'admin' && advantage.partnerId !== requesterId) {
        throw DomainErrors.advantageOwnership();
      }

      return prisma.advantage.update({
        where: { id },
        data: input,
        include: { partner: { include: { user: true } } }
      });
    },

    async delete(id: string, requesterId: string, requesterRole: string) {
      const advantage = await prisma.advantage.findUnique({ where: { id } });
      if (!advantage) throw DomainErrors.advantageNotFound();
      if (requesterRole !== 'admin' && advantage.partnerId !== requesterId) {
        throw DomainErrors.advantageOwnership();
      }
      await prisma.advantage.delete({ where: { id } });
      return advantage;
    },

    async redeem(advantageId: string, studentId: string) {
      const advantage = await prisma.advantage.findUnique({
        where: { id: advantageId },
        include: { partner: { include: { user: true } } }
      });
      if (!advantage) throw DomainErrors.advantageNotFound();
      if (!advantage.isActive) throw DomainErrors.advantageInactive();

      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { user: true }
      });
      if (!student) throw DomainErrors.studentNotFound();
      if (!CoinBalance.create(student.coinBalance).canDeduct(advantage.costInCoins)) {
        throw DomainErrors.insufficientBalance();
      }

      const code = generateCode();

      const redemption = await prisma.$transaction(async (tx) => {
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
      return prisma.redemption.findMany({
        where: { studentId },
        include: {
          advantage: { include: { partner: true } },
          student: { include: { user: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    },

    async listRedemptionsByAdvantage(advantageId: string, requesterId: string, requesterRole: string) {
      const advantage = await prisma.advantage.findUnique({ where: { id: advantageId } });
      if (!advantage) throw DomainErrors.advantageNotFound();
      if (requesterRole === 'partner' && advantage.partnerId !== requesterId) {
        throw DomainErrors.advantageOwnership();
      }
      const where = requesterRole === 'student'
        ? { advantageId, studentId: requesterId }
        : { advantageId };
      return prisma.redemption.findMany({
        where,
        include: {
          advantage: { include: { partner: true } },
          student: { include: { user: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    },

    async listPartnerRedemptions(partnerId: string) {
      return prisma.redemption.findMany({
        where: { advantage: { partnerId } },
        include: {
          advantage: { include: { partner: true } },
          student: { include: { user: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    }
  };
}
