import type { PrismaClient } from '@prisma/client';
import type { PrismaTx } from '../../../shared/infra/unit-of-work.js';
import type { StudentCoinPort, StudentCoinView } from '../domain/student-coin.port.js';

export class PrismaStudentCoinRepository implements StudentCoinPort {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<StudentCoinView | null> {
    const row = await this.prisma.student.findUnique({ where: { id }, include: { user: true } });
    if (!row) return null;
    return { id: row.id, coinBalance: row.coinBalance, user: { name: row.user.name, email: row.user.email } };
  }

  async deductCoins(id: string, amount: number, tx: PrismaTx): Promise<boolean> {
    const result = await tx.student.updateMany({
      where: { id, coinBalance: { gte: amount } },
      data: { coinBalance: { decrement: amount } }
    });
    return result.count > 0;
  }
}
