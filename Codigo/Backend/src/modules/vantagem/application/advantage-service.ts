import { randomBytes } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';
import { DomainErrors } from '../../../shared/errors/domain-errors.js';
import { CoinBalance } from '../../../shared/domain/value-objects/coin-balance.js';
import { sendStudentCouponEmail, sendPartnerRedemptionEmail } from '../../../shared/email/email-service.js';
import type { AdvantageRepository } from '../domain/advantage.repository.js';
import { AdvantageEntity } from '../domain/advantage.entity.js';
import type { StudentCoinPort } from '../domain/student-coin.port.js';

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

export function createAdvantageService(prisma: PrismaClient, advantageRepo: AdvantageRepository, studentCoinPort: StudentCoinPort) {
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
      const advantage = await advantageRepo.findById(id);
      if (!advantage) throw DomainErrors.advantageNotFound();
      advantage.verifyOwnership(requesterId, requesterRole);

      return prisma.advantage.update({
        where: { id },
        data: input,
        include: { partner: { include: { user: true } } }
      });
    },

    async delete(id: string, requesterId: string, requesterRole: string) {
      const advantage = await advantageRepo.findById(id);
      if (!advantage) throw DomainErrors.advantageNotFound();
      advantage.verifyOwnership(requesterId, requesterRole);

      await prisma.advantage.delete({ where: { id } });
    },

    async redeem(advantageId: string, studentId: string) {
      const advantageData = await prisma.advantage.findUnique({
        where: { id: advantageId },
        include: { partner: { include: { user: true } } }
      });
      if (!advantageData) throw DomainErrors.advantageNotFound();

      // Domain check via entity — no extra query needed
      const advantage = new AdvantageEntity(advantageData.id, advantageData.partnerId, advantageData.title, advantageData.costInCoins, advantageData.isActive);
      advantage.assertAvailable();

      const student = await studentCoinPort.findById(studentId);
      if (!student) throw DomainErrors.studentNotFound();
      // Eager check for a clear error message on the obvious case.
      // The real guard is the conditional atomic decrement inside the TX below.
      if (!CoinBalance.create(student.coinBalance).canDeduct(advantageData.costInCoins)) {
        throw DomainErrors.insufficientBalance();
      }

      const code = generateCode();

      const redemption = await prisma.$transaction(async (tx) => {
        // Atomic conditional decrement — real concurrency guard, balance cannot go negative.
        const deducted = await studentCoinPort.deductCoins(studentId, advantageData.costInCoins, tx);
        if (!deducted) throw DomainErrors.insufficientBalance();

        return tx.redemption.create({
          data: { code, coinCost: advantageData.costInCoins, studentId, advantageId },
          include: { advantage: { include: { partner: { include: { user: true } } } }, student: { include: { user: true } } }
        });
      });

      void sendStudentCouponEmail(
        student.user.email,
        student.user.name,
        advantageData.title,
        advantageData.partner.corporateName,
        advantageData.costInCoins,
        code
      );
      void sendPartnerRedemptionEmail(
        advantageData.partner.user.email,
        advantageData.partner.corporateName,
        student.user.name,
        advantageData.title,
        advantageData.costInCoins,
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
      const advantage = await advantageRepo.findById(advantageId);
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
