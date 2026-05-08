export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};
