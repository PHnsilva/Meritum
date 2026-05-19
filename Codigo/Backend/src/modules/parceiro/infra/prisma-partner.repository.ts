import type { PrismaClient } from '@prisma/client';
import { PartnerEntity, type PartnerStatus } from '../domain/partner.entity.js';
import type { PartnerRepository } from '../domain/partner.repository.js';

export class PrismaPartnerRepository implements PartnerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<PartnerEntity | null> {
    const row = await this.prisma.partnerCompany.findUnique({
      where: { id },
      include: { user: true }
    });
    if (!row) return null;
    return new PartnerEntity(row.id, row.corporateName, row.status as PartnerStatus, { name: row.user.name, email: row.user.email });
  }

  async approve(id: string): Promise<PartnerEntity> {
    const row = await this.prisma.partnerCompany.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: { user: true }
    });
    return new PartnerEntity(row.id, row.corporateName, row.status as PartnerStatus, { name: row.user.name, email: row.user.email });
  }
}
