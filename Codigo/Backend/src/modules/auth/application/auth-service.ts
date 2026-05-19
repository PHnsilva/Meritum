import { hashPassword } from '../../../shared/security/password-hasher.js';
import { DomainErrors } from '../../../shared/errors/domain-errors.js';
import { EmailVO } from '../../../shared/domain/value-objects/email-vo.js';
import { Password } from '../../../shared/domain/value-objects/password.js';
import { UserEntity } from '../domain/user.entity.js';
import { eventBus } from '../../../shared/domain/events/event-bus.js';
import { UserPasswordChangedEvent } from '../../../shared/domain/events/user-password-changed-event.js';
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
export type ChangePasswordInput = { email: string; newPassword: string; currentPassword?: string };

export function createAuthService(userRepo: UserRepository) {
  return {
    async login(input: LoginInput): Promise<AuthUserResult | null> {
      const userRead = await userRepo.findByEmail(input.email);
      if (!userRead) return null;

      const entity = new UserEntity(
        userRead.id,
        EmailVO.create(userRead.email),
        userRead.role as any,
        Password.fromHash(userRead.passwordHash),
        userRead.mustChangePassword
      );

      if (!entity.verifyPassword(input.password)) return null;

      if (userRead.role === 'PARTNER' && userRead.partnerCompany?.status === 'PENDING') {
        throw DomainErrors.accountPending();
      }
      if (userRead.role === 'INSTITUTION' && userRead.institution?.status === 'PENDING') {
        throw DomainErrors.accountPending();
      }

      const coinBalance = userRead.student?.coinBalance ?? userRead.professor?.coinBalance ?? null;
      const entityId = userRead.student?.id ?? userRead.professor?.id ?? userRead.partnerCompany?.id ?? userRead.institution?.id ?? userRead.id;

      return {
        id: entityId,
        name: userRead.name,
        email: userRead.email,
        role: userRead.role.toLowerCase(),
        coinBalance,
        mustChangePassword: userRead.mustChangePassword,
        createdAt: userRead.createdAt,
        updatedAt: userRead.updatedAt
      };
    },

    async updateAdminPerfil(entityId: string, data: UpdatePerfilInput): Promise<void> {
      const user = await userRepo.findById(entityId);
      if (!user) throw DomainErrors.userNotFound();
      await userRepo.updateProfile(entityId, data);
    },

    async changePassword(input: ChangePasswordInput): Promise<void> {
      const userRead = await userRepo.findByEmail(input.email);
      if (!userRead) throw DomainErrors.userNotFound();

      const entity = new UserEntity(
        userRead.id,
        EmailVO.create(userRead.email),
        userRead.role as any,
        Password.fromHash(userRead.passwordHash),
        userRead.mustChangePassword
      );

      if (input.currentPassword) {
        entity.changePassword(input.newPassword, input.currentPassword);
      } else {
        entity.changeInitialPassword(input.newPassword);
      }

      await userRepo.updatePassword(entity.id, entity.passwordHash, entity.mustChangePassword);
      eventBus.publish(new UserPasswordChangedEvent(entity.id, entity.email.value));
    }
  };
}
