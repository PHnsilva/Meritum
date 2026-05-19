import type { PrismaClient } from '@prisma/client';
import type { InstitutionData, InstitutionRepository, InstitutionRedemption, InstitutionTransaction, RegisterInstitutionData } from '../domain/institution.repository.js';

export class PrismaInstitutionRepository implements InstitutionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(status?: 'PENDING' | 'APPROVED'): Promise<InstitutionData[]> {
    return this.prisma.institution.findMany({
      where: status ? { status } : undefined,
      orderBy: { name: 'asc' }
    });
  }

  async findById(id: string): Promise<InstitutionData | null> {
    const inst = await this.prisma.institution.findUnique({
      where: { id },
      include: { user: true }
    });
    if (!inst) return null;
    return { ...inst, userEmail: inst.user?.email ?? undefined, userName: inst.user?.name ?? undefined };
  }

  findByUserId(userId: string): Promise<InstitutionData | null> {
    return this.prisma.institution.findFirst({ where: { userId } });
  }

  async create(name: string): Promise<InstitutionData> {
    return this.prisma.institution.create({ data: { name: name.trim(), status: 'APPROVED' } });
  }

  async register(data: RegisterInstitutionData): Promise<{ institution: InstitutionData; userEmail: string }> {
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name: data.name, email: data.email, passwordHash: data.passwordHash, role: 'INSTITUTION' }
      });
      const institution = await tx.institution.create({
        data: { name: data.name.trim(), userId: user.id, status: 'PENDING' }
      });
      return { institution, userEmail: user.email };
    });
    return result;
  }

  async approve(id: string): Promise<{ institution: InstitutionData; userEmail: string; userName: string } | null> {
    const existing = await this.prisma.institution.findUnique({ where: { id }, include: { user: true } });
    if (!existing || !existing.user) return null;
    const institution = await this.prisma.institution.update({
      where: { id },
      data: { status: 'APPROVED' }
    });
    return { institution, userEmail: existing.user.email, userName: existing.user.name };
  }

  async update(id: string, name: string): Promise<InstitutionData | null> {
    const existing = await this.prisma.institution.findUnique({ where: { id } });
    if (!existing) return null;
    return this.prisma.institution.update({ where: { id }, data: { name: name.trim() } });
  }

  async updateWithUser(id: string, data: { name?: string; email?: string; passwordHash?: string }): Promise<InstitutionData | null> {
    const existing = await this.prisma.institution.findUnique({ where: { id }, include: { user: true } });
    if (!existing) return null;
    return this.prisma.$transaction(async (tx) => {
      if ((data.email || data.passwordHash) && existing.userId) {
        await tx.user.update({
          where: { id: existing.userId },
          data: {
            ...(data.email ? { email: data.email } : {}),
            ...(data.passwordHash ? { passwordHash: data.passwordHash } : {})
          }
        });
      }
      if (data.name) {
        return tx.institution.update({ where: { id }, data: { name: data.name.trim() } });
      }
      // Fetch fresh data so caller sees the updated user fields, not the pre-update snapshot.
      const fresh = await tx.institution.findUnique({ where: { id }, include: { user: true } });
      if (!fresh) return null;
      return { ...fresh, userEmail: fresh.user?.email ?? undefined, userName: fresh.user?.name ?? undefined };
    });
  }

  async updateLinkedUser(institutionId: string, data: { name?: string; email?: string }): Promise<void> {
    const institution = await this.prisma.institution.findUnique({ where: { id: institutionId } });
    if (!institution?.userId) return;
    await this.prisma.user.update({
      where: { id: institution.userId },
      data: { ...(data.name ? { name: data.name } : {}), ...(data.email ? { email: data.email } : {}) }
    });
  }

  async findTransactions(institutionId: string): Promise<{ transactions: InstitutionTransaction[]; redemptions: InstitutionRedemption[] }> {
    const [transactions, redemptions] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { student: { institutionId } },
        include: {
          professor: { include: { user: true } },
          student: { include: { user: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.redemption.findMany({
        where: { student: { institutionId } },
        include: {
          student: { include: { user: true } },
          advantage: { include: { partner: { include: { user: true } } } }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      transactions: transactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        motive: t.motive,
        createdAt: t.createdAt,
        professor: { name: t.professor.user.name, email: t.professor.user.email, department: t.professor.department },
        student: { name: t.student.user.name, email: t.student.user.email, course: t.student.course }
      })),
      redemptions: redemptions.map((r) => ({
        id: r.id,
        code: r.code,
        coinCost: r.coinCost,
        createdAt: r.createdAt,
        student: { name: r.student.user.name, email: r.student.user.email },
        advantage: { title: r.advantage.title, partner: { name: r.advantage.partner.corporateName } }
      }))
    };
  }

  async delete(id: string): Promise<InstitutionData | null> {
    const existing = await this.prisma.institution.findUnique({ where: { id } });
    if (!existing) return null;

    await this.prisma.$transaction(async (tx) => {
      // Collect linked entity IDs before deletion
      const students = await tx.student.findMany({ where: { institutionId: id }, select: { id: true, userId: true } });
      const professors = await tx.professor.findMany({ where: { institutionId: id }, select: { id: true, userId: true } });

      const studentIds = students.map((s) => s.id);
      const professorIds = professors.map((p) => p.id);

      // Delete transactions (reference both student and professor — no cascade in schema)
      if (studentIds.length > 0 || professorIds.length > 0) {
        await tx.transaction.deleteMany({
          where: {
            OR: [
              ...(studentIds.length > 0 ? [{ studentId: { in: studentIds } }] : []),
              ...(professorIds.length > 0 ? [{ professorId: { in: professorIds } }] : [])
            ]
          }
        });
      }

      // Delete redemptions (reference students — no cascade in schema)
      if (studentIds.length > 0) {
        await tx.redemption.deleteMany({ where: { studentId: { in: studentIds } } });
      }

      // Delete students and professors, then their users
      if (studentIds.length > 0) await tx.student.deleteMany({ where: { institutionId: id } });
      if (professorIds.length > 0) await tx.professor.deleteMany({ where: { institutionId: id } });

      const allUserIds = [
        ...students.map((s) => s.userId),
        ...professors.map((p) => p.userId)
      ].filter(Boolean) as string[];
      if (allUserIds.length > 0) {
        await tx.user.deleteMany({ where: { id: { in: allUserIds } } });
      }

      // Delete institution and its linked user
      await tx.institution.delete({ where: { id } });
      if (existing.userId) await tx.user.delete({ where: { id: existing.userId } });
    });

    return existing;
  }
}
