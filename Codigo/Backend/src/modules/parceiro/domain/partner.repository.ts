import type { PartnerEntity } from './partner.entity.js';

export interface PartnerRepository {
  findById(id: string): Promise<PartnerEntity | null>;
  approve(id: string): Promise<PartnerEntity>;
}
