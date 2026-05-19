import type { PrismaClient } from '@prisma/client';
import type { PrismaTx } from '../../../shared/infra/unit-of-work.js';
import { AdvantageEntity } from '../domain/advantage.entity.js';
import type {
  AdvantageRepository,
  AdvantageReadModel,
  RedemptionReadModel,
  CreateAdvantageData,
  UpdateAdvantageData,
  CreateRedemptionData,
} from '../domain/advantage.repository.js';

const partnerInclude = { include: { user: true } } as const;
const advantageInclude = { include: { partner: partnerInclude } } as const;
const redemptionInclude = {
  include: {
    advantage: { include: { partner: true } },
    student: { include: { user: true } },
  },
} as const;

type AdvantageRow = {
  id: string; title: string; description: string; imageUrl: string | null;
  costInCoins: number; isActive: boolean; partnerId: string; createdAt: Date; updatedAt: Date;
  partner: { id: string; corporateName: string; tradeName: string | null; user: { email: string } };
};

type RedemptionRow = {
  id: string; code: string; coinCost: number; createdAt: Date;
  advantageId: string; studentId: string;
  advantage: { id: string; title: string; partner: { corporateName: string } };
  student: { id: string; user: { name: string; email: string } };
};

function toAdvantageReadModel(row: AdvantageRow): AdvantageReadModel {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.imageUrl,
    costInCoins: row.costInCoins,
    isActive: row.isActive,
    partnerId: row.partnerId,
    partner: {
      id: row.partner.id,
      corporateName: row.partner.corporateName,
      tradeName: row.partner.tradeName,
      user: { email: row.partner.user.email },
    },
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toRedemptionReadModel(row: RedemptionRow): RedemptionReadModel {
  return {
    id: row.id,
    code: row.code,
    coinCost: row.coinCost,
    createdAt: row.createdAt,
    advantageId: row.advantageId,
    studentId: row.studentId,
    advantage: {
      id: row.advantage.id,
      title: row.advantage.title,
      partner: { corporateName: row.advantage.partner.corporateName },
    },
    student: {
      id: row.student.id,
      user: { name: row.student.user.name, email: row.student.user.email },
    },
  };
}

export class PrismaAdvantageRepository implements AdvantageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<AdvantageEntity | null> {
    const row = await this.prisma.advantage.findUnique({ where: { id } });
    if (!row) return null;
    return new AdvantageEntity(row.id, row.partnerId, row.title, row.costInCoins, row.isActive);
  }

  async findByIdWithPartner(id: string): Promise<AdvantageReadModel | null> {
    const row = await this.prisma.advantage.findUnique({ where: { id }, ...advantageInclude });
    return row ? toAdvantageReadModel(row as AdvantageRow) : null;
  }

  async list(): Promise<AdvantageReadModel[]> {
    const rows = await this.prisma.advantage.findMany({
      where: { isActive: true },
      ...advantageInclude,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => toAdvantageReadModel(r as AdvantageRow));
  }

  async listByPartner(partnerId: string): Promise<AdvantageReadModel[]> {
    const rows = await this.prisma.advantage.findMany({
      where: { partnerId },
      ...advantageInclude,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => toAdvantageReadModel(r as AdvantageRow));
  }

  async listAll(): Promise<AdvantageReadModel[]> {
    const rows = await this.prisma.advantage.findMany({
      ...advantageInclude,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => toAdvantageReadModel(r as AdvantageRow));
  }

  async create(data: CreateAdvantageData): Promise<AdvantageReadModel> {
    const row = await this.prisma.advantage.create({ data, ...advantageInclude });
    return toAdvantageReadModel(row as AdvantageRow);
  }

  async update(id: string, data: UpdateAdvantageData): Promise<AdvantageReadModel> {
    const row = await this.prisma.advantage.update({ where: { id }, data, ...advantageInclude });
    return toAdvantageReadModel(row as AdvantageRow);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.advantage.delete({ where: { id } });
  }

  async createRedemption(data: CreateRedemptionData, tx: PrismaTx): Promise<RedemptionReadModel> {
    const row = await tx.redemption.create({
      data,
      ...redemptionInclude,
    });
    return toRedemptionReadModel(row as RedemptionRow);
  }

  async listRedemptionsByStudent(studentId: string): Promise<RedemptionReadModel[]> {
    const rows = await this.prisma.redemption.findMany({
      where: { studentId },
      ...redemptionInclude,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => toRedemptionReadModel(r as RedemptionRow));
  }

  async listRedemptionsByAdvantage(
    advantageId: string,
    filter?: { studentId?: string }
  ): Promise<RedemptionReadModel[]> {
    const rows = await this.prisma.redemption.findMany({
      where: { advantageId, ...(filter?.studentId ? { studentId: filter.studentId } : {}) },
      ...redemptionInclude,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => toRedemptionReadModel(r as RedemptionRow));
  }

  async listRedemptionsByPartner(partnerId: string): Promise<RedemptionReadModel[]> {
    const rows = await this.prisma.redemption.findMany({
      where: { advantage: { partnerId } },
      ...redemptionInclude,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => toRedemptionReadModel(r as RedemptionRow));
  }
}
