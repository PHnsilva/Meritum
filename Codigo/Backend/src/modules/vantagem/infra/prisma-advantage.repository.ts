import type { PrismaClient } from '@prisma/client';
import { AdvantageEntity } from '../domain/advantage.entity.js';
import type { AdvantageRepository, CreateAdvantageData, UpdateAdvantageData } from '../domain/advantage.repository.js';

export class PrismaAdvantageRepository implements AdvantageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<AdvantageEntity | null> {
    const row = await this.prisma.advantage.findUnique({ where: { id } });
    if (!row) return null;
    return new AdvantageEntity(row.id, row.partnerId, row.title, row.costInCoins, row.isActive);
  }

  async create(data: CreateAdvantageData): Promise<AdvantageEntity> {
    const row = await this.prisma.advantage.create({ data });
    return new AdvantageEntity(row.id, row.partnerId, row.title, row.costInCoins, row.isActive);
  }

  async update(id: string, data: UpdateAdvantageData): Promise<AdvantageEntity> {
    const row = await this.prisma.advantage.update({ where: { id }, data });
    return new AdvantageEntity(row.id, row.partnerId, row.title, row.costInCoins, row.isActive);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.advantage.delete({ where: { id } });
  }
}
