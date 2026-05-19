import { apiClient } from '../../../shared/http/apiClient';
import type { CreateProfessorInput, Professor, UpdateProfessorInput } from '../types/professor';

export async function listProfessores(institutionId?: string): Promise<Professor[]> {
  const params = new URLSearchParams({ limit: '200' });
  if (institutionId) params.set('institutionId', institutionId);
  const result = await apiClient<{ data: Professor[] }>(`/api/professores?${params}`);
  return result.data;
}

export function getProfessor(id: string) {
  return apiClient<Professor>(`/api/professores/${id}`);
}

export function createProfessor(input: CreateProfessorInput) {
  return apiClient<Professor>('/api/professores', {
    method: 'POST',
    body: input
  });
}

export function updateProfessor(id: string, input: UpdateProfessorInput) {
  return apiClient<Professor>(`/api/professores/${id}`, {
    method: 'PUT',
    body: input
  });
}

export function deleteProfessor(id: string) {
  return apiClient<void>(`/api/professores/${id}`, { method: 'DELETE' });
}
