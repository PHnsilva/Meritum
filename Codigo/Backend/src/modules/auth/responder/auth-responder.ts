import type { AuthUserResult } from '../application/auth-service.js';

export function toAuthUserResponse(result: AuthUserResult, token: string) {
  return {
    token,
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
