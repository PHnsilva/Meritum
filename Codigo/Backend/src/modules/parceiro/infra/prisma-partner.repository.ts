import type { PrismaClient } from '@prisma/client';
import { PartnerEntity, type PartnerStatus } from '../domain/partner.entity.js';
import { EmailVO } from '../../../shared/domain/value-objects/email-vo.js';
import type {
  PartnerRepository,
  PartnerReadModel,
  CreatePartnerData,
  UpdatePartnerData,
} from '../domain/partner.repository.js';

type PartnerRow = {
  id: string; corporateName: string; tradeName: string | null;
  cnpj: string; address: string; status: string; createdAt: Date; updatedAt: Date;
  user: { id: string; name: string; email: string; role: string };
};

function toReadModel(row: PartnerRow): PartnerReadModel {
  return {
    id: row.id,
    corporateName: row.corporateName,
    tradeName: row.tradeName,
    cnpj: row.cnpj,
    address: row.address,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    user: { id: row.user.id, name: row.user.name, email: row.user.email, role: row.user.role },
  };
}

function toEntity(row: PartnerRow): PartnerEntity {
  return new PartnerEntity(
    row.id,
    row.corporateName,
    EmailVO.create(row.user.email),
    row.status as PartnerStatus,
    { name: row.user.name, email: row.user.email }
  );
}

const include = { user: true } as const;

export class PrismaPartnerRepository implements PartnerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<PartnerEntity | null> {
    const row = await this.prisma.partnerCompany.findUnique({ where: { id }, include });
    if (!row) return null;
    return new PartnerEntity(
      row.id,
      row.corporateName,
      EmailVO.create(row.user.email),
      row.status as PartnerStatus,
      { name: row.user.name, email: row.user.email }
    );
  }

  async findByIdFull(id: string): Promise<PartnerReadModel | null> {
    const row = await this.prisma.partnerCompany.findUnique({ where: { id }, include });
    return row ? toReadModel(row as PartnerRow) : null;
  }

  async list(
    filter?: { status?: 'PENDING' | 'APPROVED' },
    skip = 0,
    take = 50
  ): Promise<PartnerReadModel[]> {
    const rows = await this.prisma.partnerCompany.findMany({
      where: filter?.status ? { status: filter.status } : undefined,
      include,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
    return rows.map((r) => toReadModel(r as PartnerRow));
  }

  count(filter?: { status?: 'PENDING' | 'APPROVED' }): Promise<number> {
    return this.prisma.partnerCompany.count({
      where: filter?.status ? { status: filter.status } : undefined,
    });
  }

  async create(data: CreatePartnerData): Promise<PartnerEntity> {
    const row = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.corporateName,
          email: data.email,
          passwordHash: data.passwordHash,
          role: 'PARTNER',
        },
      });
      return tx.partnerCompany.create({
        data: {
          userId: user.id,
          corporateName: data.corporateName,
          tradeName: data.tradeName,
          cnpj: data.cnpj,
          address: data.address,
          status: data.status,
        },
        include,
      });
    });
    return toEntity(row as PartnerRow);
  }

  async approve(id: string): Promise<PartnerEntity> {
    const row = await this.prisma.partnerCompany.update({
      where: { id },
      data: { status: 'APPROVED' },
      include,
    });
    return toEntity(row as PartnerRow);
  }

  async update(id: string, data: UpdatePartnerData): Promise<PartnerEntity | null> {
    const existing = await this.prisma.partnerCompany.findUnique({ where: { id }, include });
    if (!existing) return null;

    const row = await this.prisma.$transaction(async (tx) => {
      if (data.corporateName || data.email || data.passwordHash) {
        await tx.user.update({
          where: { id: existing.userId },
          data: {
            ...(data.corporateName ? { name: data.corporateName } : {}),
            ...(data.email ? { email: data.email } : {}),
            ...(data.passwordHash ? { passwordHash: data.passwordHash } : {}),
          },
        });
      }
      return tx.partnerCompany.update({
        where: { id },
        data: {
          ...(data.corporateName ? { corporateName: data.corporateName } : {}),
          ...(data.tradeName !== undefined ? { tradeName: data.tradeName } : {}),
          ...(data.cnpj ? { cnpj: data.cnpj } : {}),
          ...(data.address ? { address: data.address } : {}),
        },
        include,
      });
    });
    return toEntity(row as PartnerRow);
  }

  async delete(id: string): Promise<PartnerEntity | null> {
    const existing = await this.prisma.partnerCompany.findUnique({ where: { id }, include });
    if (!existing) return null;
    await this.prisma.user.delete({ where: { id: existing.userId } });
    return toEntity(existing as PartnerRow);
  }
}
