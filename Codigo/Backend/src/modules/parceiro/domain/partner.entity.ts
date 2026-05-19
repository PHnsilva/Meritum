import { DomainErrors } from '../../../shared/errors/domain-errors.js';

export type PartnerStatus = 'PENDING' | 'APPROVED';

export class PartnerEntity {
  constructor(
    readonly id: string,
    readonly corporateName: string,
    readonly status: PartnerStatus,
    readonly user: { name: string; email: string }
  ) {}

  assertApproved(): void {
    if (this.status !== 'APPROVED') throw DomainErrors.accountPending();
  }

  isPending(): boolean {
    return this.status === 'PENDING';
  }
}
