import type { PrismaClient } from '@prisma/client';
import { DomainErrors } from '../../../shared/errors/domain-errors.js';
import type { ProfessorRepository, ProfessorReadModel, ProfessorCreateData, ProfessorUpdateData, ActivationUserView } from '../domain/professor.repository.js';

const include = { user: true, institution: true } as const;

export class PrismaProfessorRepository implements ProfessorRepository {
  constructor(private readonly prisma: PrismaClient) {}

  list(skip = 0, take = 50, institutionId?: string): Promise<ProfessorReadModel[]> {
    return this.prisma.professor.findMany({
      where: institutionId ? { institutionId } : undefined,
      include,
      orderBy: { createdAt: 'desc' },
      skip,
      take
    }) as Promise<ProfessorReadModel[]>;
  }

  count(institutionId?: string): Promise<number> {
    return this.prisma.professor.count({ where: institutionId ? { institutionId } : undefined });
  }

  findById(id: string): Promise<ProfessorReadModel | null> {
    return this.prisma.professor.findUnique({ where: { id }, include }) as Promise<ProfessorReadModel | null>;
  }

  async create(data: ProfessorCreateData): Promise<ProfessorReadModel> {
    const inst = await this.prisma.institution.findUnique({ where: { id: data.institutionId } });
    if (!inst) throw DomainErrors.institutionNotFound();

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          cpf: data.cpf,
          passwordHash: data.passwordHash,
          mustChangePassword: data.mustChangePassword,
          role: 'PROFESSOR'
        }
      });
      return tx.professor.create({
        data: { userId: user.id, department: data.department, institutionId: data.institutionId },
        include
      });
    }) as Promise<ProfessorReadModel>;
  }

  async update(id: string, data: ProfessorUpdateData): Promise<ProfessorReadModel | null> {
    const professor = await this.prisma.professor.findUnique({ where: { id }, include: { user: true } });
    if (!professor) return null;

    if (data.institutionId) {
      const inst = await this.prisma.institution.findUnique({ where: { id: data.institutionId } });
      if (!inst) throw DomainErrors.institutionNotFound();
    }

    return this.prisma.$transaction(async (tx) => {
      if (data.name ?? data.email ?? data.cpf) {
        await tx.user.update({
          where: { id: professor.userId },
          data: {
            ...(data.name ? { name: data.name } : {}),
            ...(data.email ? { email: data.email } : {}),
            ...(data.cpf ? { cpf: data.cpf } : {})
          }
        });
      }
      return tx.professor.update({
        where: { id },
        data: {
          ...(data.department ? { department: data.department } : {}),
          ...(data.institutionId ? { institutionId: data.institutionId } : {})
        },
        include
      });
    }) as Promise<ProfessorReadModel>;
  }

  async delete(id: string): Promise<ProfessorReadModel | null> {
    const professor = await this.prisma.professor.findUnique({ where: { id }, include });
    if (!professor) return null;

    await this.prisma.$transaction(async (tx) => {
      await tx.transaction.deleteMany({ where: { professorId: id } });
      await tx.user.delete({ where: { id: professor.userId } });
    });

    return professor as ProfessorReadModel;
  }

  async findActivationUser(email: string): Promise<ActivationUserView | null> {
    // Busca case-insensitive + trim: o professor pode digitar o email com
    // maiúsculas ou espaços diferentes de como foi cadastrado.
    const user = await this.prisma.user.findFirst({
      where: { email: { equals: email.trim(), mode: 'insensitive' } }
    });
    if (!user || user.role !== 'PROFESSOR') return null;
    return { id: user.id, name: user.name, email: user.email };
  }

  async setTemporaryPassword(userId: string, hash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hash, mustChangePassword: true }
    });
  }
}
