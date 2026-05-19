import type { PrismaClient } from '@prisma/client';
import type { CoinQueryPort, InstitutionCoinTransactionReadModel } from '../../../shared/domain/ports/coin-query.port.js';

export class CoinQueryAdapter implements CoinQueryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async getInstitutionTransactions(institutionId: string): Promise<InstitutionCoinTransactionReadModel[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: { student: { institutionId } },
      include: {
        professor: { include: { user: true } },
        student: { include: { user: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return transactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      motive: t.motive,
      createdAt: t.createdAt,
      professor: { name: t.professor.user.name, email: t.professor.user.email, department: t.professor.department },
      student: { name: t.student.user.name, email: t.student.user.email, course: t.student.course }
    }));
  }
}
