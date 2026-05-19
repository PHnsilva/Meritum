import type { PrismaClient } from '@prisma/client';
import { StudentEntity } from '../domain/student.entity.js';
import { CoinBalance } from '../../../shared/domain/value-objects/coin-balance.js';
import { CPF } from '../../../shared/domain/value-objects/cpf.js';
import { RG } from '../../../shared/domain/value-objects/rg.js';
import { Address } from '../../../shared/domain/value-objects/address.js';
import { Course } from '../../../shared/domain/value-objects/course.js';
import { DomainErrors } from '../../../shared/errors/domain-errors.js';
import type { StudentRepository, StudentReadModel, StudentCreateData, StudentUpdateData } from '../domain/student.repository.js';

const include = { user: true, institution: true } as const;

export class PrismaStudentRepository implements StudentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(raw: any): StudentEntity {
    return new StudentEntity(
      raw.id,
      raw.institutionId,
      CPF.create(raw.user.cpf),
      { value: raw.user.email } as any,
      RG.create(raw.rg),
      Address.create(raw.address),
      Course.create(raw.course),
      { name: raw.user.name, email: raw.user.email },
      { id: raw.institution.id, name: raw.institution.name },
      raw.coinBalance
    );
  }

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

  async findById(id: string): Promise<StudentEntity | null> {
    const raw = await this.prisma.student.findUnique({ where: { id }, include });
    return raw ? this.toEntity(raw) : null;
  }

  findByIdWithRelations(id: string): Promise<StudentReadModel | null> {
    return this.prisma.student.findUnique({ where: { id }, include }) as Promise<StudentReadModel | null>;
  }

  async create(data: StudentCreateData): Promise<StudentEntity> {
    const inst = await this.prisma.institution.findUnique({ where: { id: data.institutionId } });
    if (!inst) throw DomainErrors.institutionNotFound();

    const raw = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name: data.name, email: data.email, cpf: data.cpf, passwordHash: data.passwordHash, role: 'STUDENT' }
      });
      return tx.student.create({
        data: { userId: user.id, rg: data.rg, address: data.address, course: data.course, institutionId: data.institutionId },
        include
      });
    });

    return this.toEntity(raw);
  }

  async update(id: string, data: StudentUpdateData): Promise<StudentEntity | null> {
    const raw = await this.prisma.student.findUnique({ where: { id }, include: { user: true } });
    if (!raw) return null;

    if (data.institutionId) {
      const inst = await this.prisma.institution.findUnique({ where: { id: data.institutionId } });
      if (!inst) throw DomainErrors.institutionNotFound();
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (data.name ?? data.email ?? data.cpf ?? data.passwordHash) {
        await tx.user.update({
          where: { id: raw.userId },
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
    });

    return this.toEntity(updated);
  }

  async delete(id: string): Promise<StudentEntity | null> {
    const raw = await this.prisma.student.findUnique({ where: { id }, include });
    if (!raw) return null;
    await this.prisma.user.delete({ where: { id: raw.userId } });
    return this.toEntity(raw);
  }
}
