import type { PrismaClient } from '@prisma/client';
import type { UserRepository, UserWithRelations, UserProfile } from '../domain/user.repository.js';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<UserWithRelations | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { student: true, professor: true, partnerCompany: true, institution: true }
    }) as Promise<UserWithRelations | null>;
  }

  async findById(id: string): Promise<UserProfile | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updatePassword(id: string, hash: string, mustChangePassword = false): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash: hash, mustChangePassword }
    });
  }

  async updateProfile(id: string, data: { name?: string; email?: string }): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.email ? { email: data.email } : {})
      }
    });
  }
}
