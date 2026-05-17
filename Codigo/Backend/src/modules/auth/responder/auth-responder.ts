import type { AuthUserResult } from '../application/auth-service.js';

export function toAuthUserResponse(result: AuthUserResult) {
  return {
    user: {
      id: result.id,
      name: result.name,
      email: result.email,
      role: result.role,
      coinBalance: result.coinBalance,
      mustChangePassword: result.mustChangePassword,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    }
  };
}
