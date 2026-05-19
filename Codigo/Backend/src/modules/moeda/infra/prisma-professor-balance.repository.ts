import type { PrismaClient } from '@prisma/client';
import type { PrismaTx } from '../../../shared/infra/unit-of-work.js';
import type { ProfessorBalancePort, ProfessorBalanceView } from '../domain/professor-balance.port.js';

export class PrismaProfessorBalanceRepository implements ProfessorBalancePort {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<ProfessorBalanceView | null> {
    const row = await this.prisma.professor.findUnique({
      where: { id },
      include: { user: true }
    });
    if (!row) return null;
    return { id: row.id, institutionId: row.institutionId, coinBalance: row.coinBalance, user: { name: row.user.name, email: row.user.email } };
  }

  async deductBalance(id: string, amount: number, tx: PrismaTx): Promise<boolean> {
    const result = await tx.professor.updateMany({
      where: { id, coinBalance: { gte: amount } },
      data: { coinBalance: { decrement: amount } }
    });
    return result.count > 0;
  }
}
