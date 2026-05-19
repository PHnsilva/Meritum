import { DomainErrors } from '../../../shared/errors/domain-errors.js';
import { EmailVO } from '../../../shared/domain/value-objects/email-vo.js';

export type InstitutionStatus = 'PENDING' | 'APPROVED';

export class InstitutionEntity {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly email: EmailVO,
    readonly status: InstitutionStatus,
    readonly user: { id: string; name: string; email: string }
  ) {}

  verifyOwnership(userId: string): void {
    if (this.user.id !== userId) throw DomainErrors.ownershipError();
  }

  canQueryData(userId: string): boolean {
    return this.user.id === userId;
  }

  assertApproved(): void {
    if (this.status !== 'APPROVED') throw DomainErrors.accountPending();
  }

  isPending(): boolean {
    return this.status === 'PENDING';
  }

  isApproved(): boolean {
    return this.status === 'APPROVED';
  }
}
