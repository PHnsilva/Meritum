import { apiClient } from '../../../shared/http/apiClient';
import type { AuthUser } from '../../../shared/types/api';

const STORAGE_KEY = 'meritum:user';

type LoginInput = {
  email: string;
  password: string;
};

export function getStoredUser() {
  const rawUser = localStorage.getItem(STORAGE_KEY);
  return rawUser ? (JSON.parse(rawUser) as AuthUser) : null;
}

export function storeUser(user: AuthUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function login(input: LoginInput) {
  const response = await apiClient<{ user: AuthUser }>('/api/auth/login', {
    method: 'POST',
    body: input
  });

  storeUser(response.user);
  return response.user;
}
