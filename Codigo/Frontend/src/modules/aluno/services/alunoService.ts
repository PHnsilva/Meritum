import { apiClient } from '../../../shared/http/apiClient';
import type { Aluno, CreateAlunoInput, UpdateAlunoInput } from '../types/aluno';

export async function listAlunos(institutionId?: string): Promise<Aluno[]> {
  const params = new URLSearchParams({ limit: '200' });
  if (institutionId) params.set('institutionId', institutionId);
  const result = await apiClient<{ data: Aluno[] }>(`/api/alunos?${params}`);
  return result.data;
}

export function createAluno(input: CreateAlunoInput) {
  return apiClient<Aluno>('/api/alunos', {
    method: 'POST',
    body: input
  });
}

export function getAluno(id: string) {
  return apiClient<Aluno>(`/api/alunos/${id}`);
}

export function updateAluno(id: string, input: UpdateAlunoInput) {
  return apiClient<Aluno>(`/api/alunos/${id}`, {
    method: 'PUT',
    body: input
  });
}

export function deleteAluno(id: string) {
  return apiClient<void>(`/api/alunos/${id}`, {
    method: 'DELETE'
  });
}
