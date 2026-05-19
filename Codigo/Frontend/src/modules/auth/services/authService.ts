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

export function updateStoredCoinBalance(delta: number) {
  const user = getStoredUser();
  if (user && user.coinBalance != null) storeUser({ ...user, coinBalance: user.coinBalance + delta });
}

export async function login(input: LoginInput) {
  const response = await apiClient<{ token: string; user: Omit<AuthUser, 'token'> }>('/api/auth/login', {
    method: 'POST',
    body: input
  });

  const user: AuthUser = { ...response.user, token: response.token };
  storeUser(user);
  return user;
}

export async function refreshToken(): Promise<void> {
  const user = getStoredUser();
  if (!user?.token) return;
  try {
    const { token } = await apiClient<{ token: string }>('/api/auth/refresh', { method: 'POST' });
    storeUser({ ...user, token });
  } catch {
    // Token expirado — deixa o usuario continuar; proximo 401 vai redirecionar para login
  }
}

function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? '')) as { exp?: number };
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export async function refreshIfExpiringSoon(): Promise<void> {
  const user = getStoredUser();
  if (!user?.token) return;
  const exp = getTokenExpiry(user.token);
  if (!exp) return;
  const oneHourMs = 60 * 60 * 1000;
  if (exp - Date.now() < oneHourMs) {
    await refreshToken();
  }
}

export async function requestActivation(email: string) {
  return apiClient<{ message: string }>('/api/professores/ativar', {
    method: 'POST',
    body: { email }
  });
}

export async function changePassword(email: string, newPassword: string) {
  const result = await apiClient<{ message: string }>('/api/auth/alterar-senha', {
    method: 'POST',
    body: { email, newPassword }
  });
  const user = getStoredUser();
  if (user) storeUser({ ...user, mustChangePassword: false });
  return result;
}

type PerfilUpdateInput = {
  name?: string;
  email?: string;
  cpf?: string;
  rg?: string;
  address?: string;
  course?: string;
  department?: string;
  corporateName?: string;
  tradeName?: string;
  cnpj?: string;
  password?: string;
};

export async function updatePerfil(input: PerfilUpdateInput) {
  const user = getStoredUser();
  if (!user) throw new Error('Sessao invalida');

  if (user.role === 'admin') {
    await apiClient('/api/auth/perfil', {
      method: 'PUT',
      body: { entityId: user.id, name: input.name, email: input.email }
    });
  } else if (user.role === 'student') {
    await apiClient(`/api/alunos/${user.id}`, { method: 'PUT', body: input });
  } else if (user.role === 'professor') {
    await apiClient(`/api/professores/${user.id}`, { method: 'PUT', body: input });
  } else if (user.role === 'partner') {
    await apiClient(`/api/parceiros/${user.id}`, { method: 'PUT', body: input });
  } else if (user.role === 'institution') {
    await apiClient('/api/instituicoes/perfil', {
      method: 'PUT',
      body: { name: input.name, email: input.email }
    });
  }

  if (input.password) {
    await apiClient('/api/auth/alterar-senha', {
      method: 'POST',
      body: { email: input.email ?? user.email, newPassword: input.password }
    });
  }

  const updatedName = input.name ?? (user.role === 'partner' ? (input.corporateName ?? user.name) : user.name);
  storeUser({ ...user, name: updatedName, email: input.email ?? user.email });
}
