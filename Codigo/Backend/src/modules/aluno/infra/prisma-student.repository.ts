import type { PrismaClient } from '@prisma/client';
import { DomainErrors } from '../../../shared/errors/domain-errors.js';
import type { StudentRepository, StudentReadModel, StudentCreateData, StudentUpdateData } from '../domain/student.repository.js';

const include = { user: true, institution: true } as const;

export class PrismaStudentRepository implements StudentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  list(institutionId?: string, skip = 0, take = 50): Promise<StudentReadModel[]> {
    return this.prisma.student.findMany({
      where: institutionId ? { institutionId } : undefined,
      include,
      orderBy: { createdAt: 'desc' },
      skip,
      take
    }) as Promise<StudentReadModel[]>;
  }

  count(institutionId?: string): Promise<number> {
    return this.prisma.student.count({
      where: institutionId ? { institutionId } : undefined
    });
  }

  findById(id: string): Promise<StudentReadModel | null> {
    return this.prisma.student.findUnique({ where: { id }, include }) as Promise<StudentReadModel | null>;
  }

  async create(data: StudentCreateData): Promise<StudentReadModel> {
    const inst = await this.prisma.institution.findUnique({ where: { id: data.institutionId } });
    if (!inst) throw DomainErrors.institutionNotFound();

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name: data.name, email: data.email, cpf: data.cpf, passwordHash: data.passwordHash, role: 'STUDENT' }
      });
      return tx.student.create({
        data: { userId: user.id, rg: data.rg, address: data.address, course: data.course, institutionId: data.institutionId },
        include
      });
    }) as Promise<StudentReadModel>;
  }

  async update(id: string, data: StudentUpdateData): Promise<StudentReadModel | null> {
    const student = await this.prisma.student.findUnique({ where: { id }, include: { user: true } });
    if (!student) return null;

    if (data.institutionId) {
      const inst = await this.prisma.institution.findUnique({ where: { id: data.institutionId } });
      if (!inst) throw DomainErrors.institutionNotFound();
    }

    return this.prisma.$transaction(async (tx) => {
      if (data.name ?? data.email ?? data.cpf ?? data.passwordHash) {
        await tx.user.update({
          where: { id: student.userId },
          data: {
            ...(data.name ? { name: data.name } : {}),
            ...(data.email ? { email: data.email } : {}),
            ...(data.cpf ? { cpf: data.cpf } : {}),
            ...(data.passwordHash ? { passwordHash: data.passwordHash } : {})
          }
        });
      }
      return tx.student.update({
        where: { id },
        data: {
          ...(data.rg ? { rg: data.rg } : {}),
          ...(data.address ? { address: data.address } : {}),
          ...(data.course ? { course: data.course } : {}),
          ...(data.institutionId ? { institutionId: data.institutionId } : {})
        },
        include
      });
    }) as Promise<StudentReadModel>;
  }

  async delete(id: string): Promise<StudentReadModel | null> {
    const student = await this.prisma.student.findUnique({ where: { id }, include });
    if (!student) return null;
    await this.prisma.user.delete({ where: { id: student.userId } });
    return student as StudentReadModel;
  }
}
