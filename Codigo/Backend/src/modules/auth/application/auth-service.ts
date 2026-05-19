import { hashPassword, verifyPassword } from '../../../shared/security/password-hasher.js';
import { DomainErrors } from '../../../shared/errors/domain-errors.js';
import type { UserRepository } from '../domain/user.repository.js';

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

export function createAuthService(userRepo: UserRepository) {
  return {
    async login(input: LoginInput): Promise<AuthUserResult | null> {
      const user = await userRepo.findByEmail(input.email);
      if (!user || !verifyPassword(input.password, user.passwordHash)) return null;

      if (user.role === 'PARTNER' && user.partnerCompany?.status === 'PENDING') {
        throw DomainErrors.accountPending();
      }
      if (user.role === 'INSTITUTION' && user.institution?.status === 'PENDING') {
        throw DomainErrors.accountPending();
      }

      const coinBalance = user.student?.coinBalance ?? user.professor?.coinBalance ?? null;
      const entityId = user.student?.id ?? user.professor?.id ?? user.partnerCompany?.id ?? user.institution?.id ?? user.id;

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
      const user = await userRepo.findById(entityId);
      if (!user) throw DomainErrors.userNotFound();
      await userRepo.updateProfile(entityId, data);
    },

    async changePassword(input: ChangePasswordInput): Promise<void> {
      const user = await userRepo.findByEmail(input.email);
      if (!user) throw DomainErrors.userNotFound();
      await userRepo.updatePassword(user.id, hashPassword(input.newPassword), false);
    }
  };
}
