import { EmailVO } from '../../../shared/domain/value-objects/email-vo.js';
import { hashPassword } from '../../../shared/security/password-hasher.js';
import { paginate, toPaginatedResult } from '../../../shared/pagination/pagination.js';
import { DomainErrors } from '../../../shared/errors/domain-errors.js';
import { eventBus } from '../../../shared/domain/events/event-bus.js';
import { ParceiroAprovadoEvent } from '../../../shared/domain/events/parceiro-aprovado-event.js';
import { ParceiroRegistradoEvent } from '../../../shared/domain/events/parceiro-registrado-event.js';
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

export function createPartnerCompanyService(partnerRepo: PartnerRepository) {
  return {
    async list(page = 1, limit = 50, status?: 'PENDING' | 'APPROVED') {
      const p = paginate(page, limit);
      const filter = status ? { status } : undefined;
      const [data, total] = await Promise.all([
        partnerRepo.list(filter, p.skip, p.take),
        partnerRepo.count(filter),
      ]);
      return toPaginatedResult(data, total, p.page, p.limit);
    },

    findById(id: string) {
      return partnerRepo.findByIdFull(id);
    },

    async create(input: CreatePartnerCompanyInput) {
      EmailVO.create(input.email);
      return partnerRepo.create({
        corporateName: input.corporateName,
        tradeName: input.tradeName,
        email: input.email,
        cnpj: input.cnpj,
        address: input.address,
        passwordHash: hashPassword(input.password),
        status: 'APPROVED',
      });
    },

    async register(input: RegisterPartnerCompanyInput) {
      EmailVO.create(input.email);
      const partner = await partnerRepo.create({
        corporateName: input.corporateName,
        tradeName: input.tradeName,
        email: input.email,
        cnpj: input.cnpj,
        address: input.address,
        passwordHash: hashPassword(input.password),
        status: 'PENDING',
      });
      eventBus.publish(new ParceiroRegistradoEvent(partner.id, partner.corporateName, partner.user.email));
      return partner;
    },

    async approve(id: string) {
      const partner = await partnerRepo.findById(id);
      if (!partner) throw DomainErrors.partnerNotFound();
      const updated = await partnerRepo.approve(id);
      eventBus.publish(new ParceiroAprovadoEvent(updated.id, updated.corporateName, updated.user.email));
      return updated;
    },

    async update(id: string, input: UpdatePartnerCompanyInput) {
      // Ensure entity exists before updating (domain logic)
      const partner = await partnerRepo.findById(id);
      if (!partner) throw DomainErrors.partnerNotFound();

      if (input.email) EmailVO.create(input.email);
      return partnerRepo.update(id, {
        corporateName: input.corporateName,
        tradeName: input.tradeName,
        cnpj: input.cnpj,
        address: input.address,
        email: input.email,
        ...(input.password ? { passwordHash: hashPassword(input.password) } : {}),
      });
    },

    async delete(id: string) {
      // Ensure entity exists before deleting (domain logic)
      const partner = await partnerRepo.findById(id);
      if (!partner) throw DomainErrors.partnerNotFound();
      return partnerRepo.delete(id);
    },
  };
}
