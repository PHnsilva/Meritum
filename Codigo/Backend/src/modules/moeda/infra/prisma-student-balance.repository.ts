import type { PrismaClient } from '@prisma/client';
import type { PrismaTx } from '../../../shared/infra/unit-of-work.js';
import type { StudentBalancePort, StudentBalanceView } from '../domain/student-balance.port.js';

export class PrismaStudentBalanceRepository implements StudentBalancePort {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<StudentBalanceView | null> {
    const row = await this.prisma.student.findUnique({
      where: { id },
      include: { user: true }
    });
    if (!row) return null;
    return { id: row.id, institutionId: row.institutionId, coinBalance: row.coinBalance, user: { name: row.user.name, email: row.user.email } };
  }

  async addBalance(id: string, amount: number, tx: PrismaTx): Promise<void> {
    await tx.student.update({ where: { id }, data: { coinBalance: { increment: amount } } });
  }
}
