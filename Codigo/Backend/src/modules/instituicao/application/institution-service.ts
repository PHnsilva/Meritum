import { hashPassword } from '../../../shared/security/password-hasher.js';
import { EmailVO } from '../../../shared/domain/value-objects/email-vo.js';
import { DomainErrors } from '../../../shared/errors/domain-errors.js';
import { eventBus } from '../../../shared/domain/events/event-bus.js';
import { InstituicaoRegistradaEvent } from '../../../shared/domain/events/instituicao-registrada-event.js';
import { InstituicaoAprovadaEvent } from '../../../shared/domain/events/instituicao-aprovada-event.js';
import type { InstitutionRepository } from '../domain/institution.repository.js';
import type { CoinQueryPort } from '../../../shared/domain/ports/coin-query.port.js';
import type { AdvantageQueryPort } from '../../../shared/domain/ports/advantage-query.port.js';

export type CreateInstitutionInput = { name: string };
export type RegisterInstitutionInput = { name: string; email: string; password: string };
export type UpdateInstitutionInput = Partial<{ name: string; email: string; password: string }>;

export function createInstitutionService(
  institutionRepo: InstitutionRepository,
  coinQueryPort: CoinQueryPort,
  advantageQueryPort: AdvantageQueryPort
) {
  return {
    list(status?: 'PENDING' | 'APPROVED') {
      return institutionRepo.findAll(status);
    },

    findById(id: string) {
      return institutionRepo.findById(id);
    },

    findByIdWithRelations(id: string) {
      return institutionRepo.findByIdWithRelations(id);
    },

    findByUserId(userId: string) {
      return institutionRepo.findByUserId(userId);
    },

    async findByIdOrThrow(id: string) {
      const institution = await institutionRepo.findById(id);
      if (!institution) throw DomainErrors.institutionNotFound();
      return institution;
    },

    create(input: CreateInstitutionInput) {
      return institutionRepo.create(input.name);
    },

    async register(input: RegisterInstitutionInput) {
      EmailVO.create(input.email);
      const result = await institutionRepo.register({
        name: input.name,
        email: input.email,
        passwordHash: hashPassword(input.password)
      });
      eventBus.publish(new InstituicaoRegistradaEvent(result.institution.id, input.name, result.userEmail));
      return result.institution;
    },

    async approve(id: string) {
      const result = await institutionRepo.approve(id);
      if (!result) throw DomainErrors.institutionNotFound();
      eventBus.publish(new InstituicaoAprovadaEvent(result.institution.id, result.institution.name, result.userEmail, result.userName));
      return result.institution;
    },

    async update(id: string, input: UpdateInstitutionInput) {
      // Ensure entity exists before updating (domain logic)
      const institution = await institutionRepo.findById(id);
      if (!institution) throw DomainErrors.institutionNotFound();

      const data: { name?: string; email?: string; passwordHash?: string } = {};
      if (input.name?.trim()) data.name = input.name.trim();
      if (input.email) { EmailVO.create(input.email); data.email = input.email; }
      if (input.password) data.passwordHash = hashPassword(input.password);
      if (Object.keys(data).length === 0) return institution;
      return institutionRepo.updateWithUser(id, data);
    },

    async updatePerfil(institutionId: string, data: { name?: string; email?: string }) {
      await institutionRepo.updateLinkedUser(institutionId, data);
    },

    async getTransactions(institutionId: string) {
      const [transactions, redemptions] = await Promise.all([
        coinQueryPort.getInstitutionTransactions(institutionId),
        advantageQueryPort.getInstitutionRedemptions(institutionId)
      ]);
      return { transactions, redemptions };
    },

    delete(id: string) {
      return institutionRepo.delete(id);
    }
  };
}
