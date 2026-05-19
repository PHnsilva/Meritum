import { randomBytes } from 'node:crypto';
import { DomainErrors } from '../../../shared/errors/domain-errors.js';
import { CoinBalance } from '../../../shared/domain/value-objects/coin-balance.js';
import { eventBus } from '../../../shared/domain/events/event-bus.js';
import { VantagemResgataEvent } from '../../../shared/domain/events/vantagem-resgata-event.js';
import type { UnitOfWork } from '../../../shared/infra/unit-of-work.js';
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

export function createAdvantageService(
  advantageRepo: AdvantageRepository,
  studentCoinPort: StudentCoinPort,
  uow: UnitOfWork
) {
  return {
    list() {
      return advantageRepo.list();
    },

    listByPartner(partnerId: string) {
      return advantageRepo.listByPartner(partnerId);
    },

    findById(id: string) {
      return advantageRepo.findByIdWithPartner(id);
    },

    create(partnerId: string, input: CreateAdvantageInput) {
      return advantageRepo.create({ ...input, partnerId });
    },

    listAll() {
      return advantageRepo.listAll();
    },

    async update(id: string, requesterId: string, requesterRole: string, input: UpdateAdvantageInput) {
      const advantage = await advantageRepo.findById(id);
      if (!advantage) throw DomainErrors.advantageNotFound();
      advantage.verifyOwnership(requesterId, requesterRole);
      return advantageRepo.update(id, input);
    },

    async delete(id: string, requesterId: string, requesterRole: string) {
      const advantage = await advantageRepo.findById(id);
      if (!advantage) throw DomainErrors.advantageNotFound();
      advantage.verifyOwnership(requesterId, requesterRole);
      await advantageRepo.delete(id);
    },

    async redeem(advantageId: string, studentId: string) {
      const advantageData = await advantageRepo.findByIdWithPartner(advantageId);
      if (!advantageData) throw DomainErrors.advantageNotFound();

      const advantage = new AdvantageEntity(
        advantageData.id,
        advantageData.partnerId,
        advantageData.title,
        advantageData.costInCoins,
        advantageData.isActive
      );
      advantage.assertAvailable();

      const student = await studentCoinPort.findById(studentId);
      if (!student) throw DomainErrors.studentNotFound();

      // Eager check for clear error on obvious case.
      // Real guard is the conditional atomic decrement inside the TX.
      if (!CoinBalance.create(student.coinBalance).canDeduct(advantageData.costInCoins)) {
        throw DomainErrors.insufficientBalance();
      }

      const code = generateCode();

      const redemption = await uow.run(async (tx) => {
        const deducted = await studentCoinPort.deductCoins(studentId, advantageData.costInCoins, tx);
        if (!deducted) throw DomainErrors.insufficientBalance();
        return advantageRepo.createRedemption(
          { code, coinCost: advantageData.costInCoins, studentId, advantageId },
          tx
        );
      });

      eventBus.publish(new VantagemResgataEvent(
        studentId,
        student.user.name,
        student.user.email,
        advantageId,
        advantageData.title,
        advantageData.partner.corporateName,
        advantageData.partner.user.email,
        advantageData.costInCoins,
        code
      ));

      return redemption;
    },

    listRedemptionsByStudent(studentId: string) {
      return advantageRepo.listRedemptionsByStudent(studentId);
    },

    async listRedemptionsByAdvantage(advantageId: string, requesterId: string, requesterRole: string) {
      const advantage = await advantageRepo.findById(advantageId);
      if (!advantage) throw DomainErrors.advantageNotFound();
      if (requesterRole === 'partner' && advantage.partnerId !== requesterId) {
        throw DomainErrors.advantageOwnership();
      }
      const filter = requesterRole === 'student' ? { studentId: requesterId } : undefined;
      return advantageRepo.listRedemptionsByAdvantage(advantageId, filter);
    },

    listPartnerRedemptions(partnerId: string) {
      return advantageRepo.listRedemptionsByPartner(partnerId);
    },
  };
}
