export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

export type UserRole = 'admin' | 'student' | 'professor' | 'partner';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  coinBalance: number | null;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
};
