import type { PrismaClient } from '@prisma/client';
import { InstitutionEntity } from '../domain/institution.entity.js';
import { EmailVO } from '../../../shared/domain/value-objects/email-vo.js';
import type { InstitutionData, InstitutionRepository, RegisterInstitutionData } from '../domain/institution.repository.js';

type InstitutionRaw = {
  id: string;
  name: string;
  status: 'PENDING' | 'APPROVED';
  createdAt: Date;
  updatedAt: Date;
  user?: { id: string; name: string; email: string } | null;
};

export class PrismaInstitutionRepository implements InstitutionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(raw: InstitutionRaw): InstitutionEntity & { createdAt: Date; updatedAt: Date } {
    const entity = new InstitutionEntity(
      raw.id,
      raw.name,
      raw.user?.email ? EmailVO.create(raw.user.email) : null,
      raw.status,
      raw.user ? { id: raw.user.id, name: raw.user.name, email: raw.user.email } : null
    );
    return Object.assign(entity, { createdAt: raw.createdAt, updatedAt: raw.updatedAt });
  }

  private toData(raw: InstitutionRaw): InstitutionData {
    return {
      id: raw.id,
      name: raw.name,
      status: raw.status,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      ...(raw.user?.email ? { userEmail: raw.user.email } : {}),
      ...(raw.user?.name ? { userName: raw.user.name } : {})
    };
  }

  async findAll(status?: 'PENDING' | 'APPROVED'): Promise<InstitutionData[]> {
    const rows = await this.prisma.institution.findMany({
      where: status ? { status } : undefined,
      include: { user: true },
      orderBy: { name: 'asc' }
    });
    return rows.map((row) => this.toData(row));
  }

  async findById(id: string): Promise<InstitutionEntity | null> {
    const inst = await this.prisma.institution.findUnique({
      where: { id },
      include: { user: true }
    });
    return inst ? this.toEntity(inst) : null;
  }

  async findByIdWithRelations(id: string): Promise<InstitutionData | null> {
    const row = await this.prisma.institution.findUnique({
      where: { id },
      include: { user: true }
    });
    return row ? this.toData(row) : null;
  }

  async findByUserId(userId: string): Promise<InstitutionEntity | null> {
    const inst = await this.prisma.institution.findFirst({
      where: { userId },
      include: { user: true }
    });
    return inst ? this.toEntity(inst) : null;
  }

  async create(name: string): Promise<InstitutionEntity> {
    const raw = await this.prisma.institution.create({
      data: { name: name.trim(), status: 'APPROVED' },
      include: { user: true }
    });
    return this.toEntity(raw);
  }

  async register(data: RegisterInstitutionData): Promise<{ institution: InstitutionEntity; userEmail: string }> {
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name: data.name, email: data.email, passwordHash: data.passwordHash, role: 'INSTITUTION' }
      });
      const institution = await tx.institution.create({
        data: { name: data.name.trim(), userId: user.id, status: 'PENDING' },
        include: { user: true }
      });
      return { institution, userEmail: user.email };
    });
    return { institution: this.toEntity(result.institution), userEmail: result.userEmail };
  }

  async approve(id: string): Promise<{ institution: InstitutionEntity; userEmail: string; userName: string } | null> {
    const existing = await this.prisma.institution.findUnique({ where: { id }, include: { user: true } });
    if (!existing || !existing.user) return null;
    const inst = await this.prisma.institution.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: { user: true }
    });
    return { institution: this.toEntity(inst), userEmail: existing.user.email, userName: existing.user.name };
  }

  async update(id: string, name: string): Promise<InstitutionEntity | null> {
    const existing = await this.prisma.institution.findUnique({ where: { id } });
    if (!existing) return null;
    const updated = await this.prisma.institution.update({
      where: { id },
      data: { name: name.trim() },
      include: { user: true }
    });
    return this.toEntity(updated);
  }

  async updateWithUser(id: string, data: { name?: string; email?: string; passwordHash?: string }): Promise<InstitutionEntity | null> {
    const existing = await this.prisma.institution.findUnique({ where: { id }, include: { user: true } });
    if (!existing) return null;
    const updated = await this.prisma.$transaction(async (tx) => {
      if ((data.email || data.passwordHash) && existing.userId) {
        await tx.user.update({
          where: { id: existing.userId },
          data: {
            ...(data.email ? { email: data.email } : {}),
            ...(data.passwordHash ? { passwordHash: data.passwordHash } : {})
          }
        });
      }
      const inst = await tx.institution.update({
        where: { id },
        data: data.name ? { name: data.name.trim() } : {},
        include: { user: true }
      });
      return inst;
    });
    return this.toEntity(updated);
  }

  async updateLinkedUser(institutionId: string, data: { name?: string; email?: string }): Promise<void> {
    const institution = await this.prisma.institution.findUnique({ where: { id: institutionId } });
    if (!institution?.userId) return;
    await this.prisma.user.update({
      where: { id: institution.userId },
      data: { ...(data.name ? { name: data.name } : {}), ...(data.email ? { email: data.email } : {}) }
    });
  }

  async delete(id: string): Promise<InstitutionEntity | null> {
    const existing = await this.prisma.institution.findUnique({ where: { id }, include: { user: true } });
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

    return this.toEntity(existing);
  }
}
