import type { PrismaClient } from '@prisma/client';
import type { PrismaTx } from '../../../shared/infra/unit-of-work.js';
import type {
  TransactionData,
  TransactionFull,
  TransactionRepository,
  TransactionWithProfessor,
  TransactionWithStudent
} from '../domain/transaction.repository.js';

const professorInclude = { user: true } as const;
const studentInclude = { user: true } as const;

export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: TransactionData, tx: PrismaTx): Promise<TransactionFull> {
    return tx.transaction.create({
      data,
      include: {
        professor: { include: { user: true } },
        student: { include: { user: true } }
      }
    }) as unknown as Promise<TransactionFull>;
  }

  async findByProfessorId(professorId: string): Promise<TransactionWithStudent[]> {
    return this.prisma.transaction.findMany({
      where: { professorId },
      include: { student: { include: studentInclude } },
      orderBy: { createdAt: 'desc' }
    }) as unknown as Promise<TransactionWithStudent[]>;
  }

  async findByStudentId(studentId: string): Promise<TransactionWithProfessor[]> {
    return this.prisma.transaction.findMany({
      where: { studentId },
      include: { professor: { include: professorInclude } },
      orderBy: { createdAt: 'desc' }
    }) as unknown as Promise<TransactionWithProfessor[]>;
  }
}
