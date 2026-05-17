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
