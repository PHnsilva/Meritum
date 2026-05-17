import type { FastifyInstance } from 'fastify';
import { generateTempPassword, hashPassword, verifyPassword } from '../../../shared/security/password-hasher.js';
import { DomainErrors } from '../../../shared/errors/domain-errors.js';

export type LoginInput = { email: string; password: string };

export type AuthUserResult = {
  id: string;
  name: string;
  email: string;
  role: string;
  coinBalance: number | null;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdatePerfilInput = { name?: string; email?: string };
export type ChangePasswordInput = { email: string; newPassword: string };
export type ActivationResult = { tempPassword: string; userName: string; userEmail: string };

export function createAuthService(app: FastifyInstance) {
  return {
    async login(input: LoginInput): Promise<AuthUserResult | null> {
      const user = await app.prisma.user.findUnique({
        where: { email: input.email },
        include: { student: true, professor: true, partnerCompany: true }
      });

      if (!user || !verifyPassword(input.password, user.passwordHash)) return null;

      const coinBalance = user.student?.coinBalance ?? user.professor?.coinBalance ?? null;
      const entityId = user.student?.id ?? user.professor?.id ?? user.partnerCompany?.id ?? user.id;

      return {
        id: entityId,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
        coinBalance,
        mustChangePassword: user.mustChangePassword,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    },

    async updateAdminPerfil(entityId: string, data: UpdatePerfilInput): Promise<void> {
      const user = await app.prisma.user.findUnique({ where: { id: entityId } });
      if (!user) throw DomainErrors.userNotFound();

      await app.prisma.user.update({
        where: { id: entityId },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.email ? { email: data.email } : {})
        }
      });
    },

    async changePassword(input: ChangePasswordInput): Promise<void> {
      const user = await app.prisma.user.findUnique({ where: { email: input.email } });
      if (!user) throw DomainErrors.userNotFound();

      await app.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashPassword(input.newPassword), mustChangePassword: false }
      });
    },

    async requestActivation(email: string): Promise<ActivationResult | null> {
      const user = await app.prisma.user.findUnique({ where: { email } });
      if (!user || user.role !== 'PROFESSOR') return null;

      const tempPassword = generateTempPassword();
      await app.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashPassword(tempPassword), mustChangePassword: true }
      });

      return { tempPassword, userName: user.name, userEmail: user.email };
    }
  };
}
