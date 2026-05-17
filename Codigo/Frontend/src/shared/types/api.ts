export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

export type UserRole = 'student' | 'professor' | 'partner';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  coinBalance: number | null;
  createdAt: string;
  updatedAt: string;
};
