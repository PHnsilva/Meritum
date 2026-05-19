import { DomainErrors } from '../../../shared/errors/domain-errors.js';

export class AdvantageEntity {
  constructor(
    readonly id: string,
    readonly partnerId: string,
    readonly title: string,
    readonly costInCoins: number,
    readonly isActive: boolean
  ) {}

  verifyOwnership(requesterId: string, role: string): void {
    if (role !== 'admin' && this.partnerId !== requesterId) {
      throw DomainErrors.advantageOwnership();
    }
  }

  assertAvailable(): void {
    if (!this.isActive) throw DomainErrors.advantageInactive();
  }
}
